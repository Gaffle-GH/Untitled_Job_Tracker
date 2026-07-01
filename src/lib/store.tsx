"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MOCK_APPLICATIONS, MOCK_DISCOVER_JOBS } from "./mock-data";
import { shuffleDiscoverJobs } from "./discover";
import { getNearbyJobsForProfile, type ScoredJob } from "./profile-match";
import {
  disconnectIntegration as disconnectIntegrationApi,
  fetchIntegrationStatuses,
  startIntegrationConnect,
  syncIntegration as syncIntegrationApi,
} from "@/services/integrationsService";
import {
  fetchMe,
  loginWithApi,
  logoutWithApi,
  createApplicationApi,
  deleteApplicationApi,
  geocodeLocationApi,
  isUnauthorizedError,
  patchApplicationNotes,
  patchApplicationStatus,
  saveProfileApi,
  searchJobsApi,
  signupWithApi,
} from "@/services/authService";
import { applicationMatchesProfileLocation } from "@/lib/location-match";
import {
  formatLocationDisplay,
  normalizeLocationStorage,
} from "@/lib/location-normalize";
import type {
  ApplicationStatus,
  ChartSelection,
  ChartView,
  DashboardFilters,
  DashboardStatusGroup,
  DiscoverJob,
  IntegrationConnection,
  IntegrationMode,
  IntegrationProvider,
  JobApplication,
  JobSource,
  ListFilters,
  SortDirection,
  SortField,
  User,
  UserProfile,
} from "./types";
import {
  DEFAULT_DASHBOARD_FILTERS,
  DEFAULT_LIST_FILTERS,
  DEFAULT_USER_PROFILE,
  STATUS_PROGRESS_ORDER,
  countByStatusGroup,
} from "./types";

interface AppState {
  user: User | null;
  applications: JobApplication[];
  discoverJobs: DiscoverJob[];
  platformJobs: DiscoverJob[];
  savedDiscoverIds: string[];
  passedDiscoverIds: string[];
  integrations: IntegrationConnection[];
  chartView: ChartView;
  sortField: SortField;
  sortDirection: SortDirection;
  dashboardFilters: DashboardFilters;
  chartSelection: ChartSelection;
  listFilters: ListFilters;
  profile: UserProfile;
  onboardingComplete: boolean;
}

interface AppContextValue extends AppState {
  databaseMode: boolean;
  notifyOnStatusChange: boolean;
  setNotifyOnStatusChange: (value: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  setChartView: (view: ChartView) => void;
  setSortField: (field: SortField) => void;
  setSortDirection: (dir: SortDirection) => void;
  toggleSortDirection: () => void;
  setDashboardFilters: (filters: DashboardFilters) => void;
  setChartSelection: (selection: ChartSelection) => void;
  clearChartSelection: () => void;
  setListFilters: (filters: ListFilters) => void;
  resetListFilters: () => void;
  connectIntegration: (provider: IntegrationProvider) => void;
  disconnectIntegration: (provider: IntegrationProvider) => Promise<void>;
  syncIntegration: (provider: IntegrationProvider) => Promise<void>;
  integrationBusy: IntegrationProvider | null;
  swipeDiscoverJob: (jobId: string, action: "save" | "pass") => void;
  undoDiscoverSwipe: () => void;
  canUndoDiscover: boolean;
  refreshDiscoverJobs: () => void;
  discoverRefreshKey: number;
  isRefreshingDiscover: boolean;
  addApplication: (job: Omit<JobApplication, "id">) => Promise<void>;
  updateApplicationStatus: (
    id: string,
    status: JobApplication["status"],
  ) => Promise<void>;
  updateApplicationNotes: (id: string, notes: string | null) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  dashboardApplications: JobApplication[];
  sortedApplications: JobApplication[];
  filteredApplications: JobApplication[];
  statusCounts: Record<string, number>;
  statusGroupCounts: Record<DashboardStatusGroup, number>;
  sourceCounts: Record<JobSource, number>;
  dashboardStats: {
    total: number;
    interview: number;
    offers: number;
    rejected: number;
    responseRate: number;
  };
  nearbyJobs: ScoredJob[];
  onboardingComplete: boolean;
  completeOnboarding: () => void;
  hydrated: boolean;
}

const STARTER_APPLICATIONS = MOCK_APPLICATIONS.filter((app) =>
  ["manual", "discover"].includes(app.source),
);

const defaultIntegrations: IntegrationConnection[] = [
  { provider: "handshake", connected: false },
  { provider: "linkedin", connected: false },
  { provider: "indeed", connected: false },
];

const AppContext = createContext<AppContextValue | null>(null);
const STORAGE_KEY = "job-tracker-state";
const ONBOARDING_STORAGE_KEY = "job-tracker-onboarding-complete";

function readOnboardingComplete() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ONBOARDING_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeOnboardingComplete(complete: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (complete) sessionStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
    else sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function loadState(): Partial<AppState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const DISCOVER_JOB_IDS = new Set(MOCK_DISCOVER_JOBS.map((job) => job.id));

function discoverIdSet(platformJobs: DiscoverJob[]) {
  return new Set([...DISCOVER_JOB_IDS, ...platformJobs.map((job) => job.id)]);
}

function sanitizeDiscoverIds(ids: string[] | undefined, platformJobs: DiscoverJob[]) {
  const valid = discoverIdSet(platformJobs);
  return (ids ?? []).filter((id) => valid.has(id));
}

function countActiveDiscoverJobs(
  savedIds: string[],
  passedIds: string[],
  pool: DiscoverJob[],
) {
  return pool.filter((job) => !savedIds.includes(job.id) && !passedIds.includes(job.id)).length;
}

function resetDiscoverDeck() {
  return shuffleDiscoverJobs(MOCK_DISCOVER_JOBS);
}

function matchesTimePeriod(appliedAt: string, period: DashboardFilters["timePeriod"]) {
  if (period === "all") return true;
  const date = new Date(appliedAt);
  const now = new Date();
  if (period === "2026") return date.getFullYear() === 2026;
  if (period === "2025") return date.getFullYear() === 2025;
  const days = period === "90d" ? 90 : 30;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

function filterDashboardApps(
  apps: JobApplication[],
  filters: DashboardFilters,
  selection: ChartSelection,
  profile: UserProfile,
) {
  return apps.filter((app) => {
    const sourceOk = filters.source === "all" || app.source === filters.source;
    const statusOk = filters.status === "all" || app.status === filters.status;
    const timeOk = matchesTimePeriod(app.appliedAt, filters.timePeriod);
    const chartStatusOk = !selection.status || app.status === selection.status;
    const chartSourceOk = !selection.source || app.source === selection.source;
    const locationOk =
      filters.locationScope === "all" ||
      (filters.locationScope === "remote" && /remote/i.test(app.location)) ||
      (filters.locationScope === "near_me" && applicationMatchesProfileLocation(app, profile));
    return sourceOk && statusOk && timeOk && chartStatusOk && chartSourceOk && locationOk;
  });
}

function filterListApps(apps: JobApplication[], filters: ListFilters) {
  const query = filters.searchQuery.trim().toLowerCase();
  return apps.filter((app) => {
    const sourceOk =
      filters.selectedSources.length === 0 || filters.selectedSources.includes(app.source);
    const statusOk =
      filters.selectedStatuses.length === 0 || filters.selectedStatuses.includes(app.status);
    const searchOk =
      !query ||
      app.company.toLowerCase().includes(query) ||
      app.title.toLowerCase().includes(query) ||
      app.location.toLowerCase().includes(query) ||
      (app.notes?.toLowerCase().includes(query) ?? false);
    return sourceOk && statusOk && searchOk;
  });
}

function mergeApplications(prev: JobApplication[], incoming: JobApplication[]) {
  const byId = new Map(prev.map((app) => [app.id, app]));
  for (const app of incoming) byId.set(app.id, app);
  return Array.from(byId.values());
}

function mergePlatformJobs(
  prev: DiscoverJob[],
  provider: IntegrationProvider,
  incoming: DiscoverJob[],
) {
  const withoutProvider = prev.filter((job) => job.source !== provider);
  return [...withoutProvider, ...incoming];
}

function statusToIntegrationConnection(
  status: Awaited<ReturnType<typeof fetchIntegrationStatuses>>["integrations"][number],
): IntegrationConnection {
  return {
    provider: status.provider,
    connected: status.connected,
    connectedAt: status.connectedAt,
    email: status.email,
    mode: status.mode ?? undefined,
    lastSyncedAt: status.lastSyncedAt,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>(STARTER_APPLICATIONS);
  const [platformJobs, setPlatformJobs] = useState<DiscoverJob[]>([]);
  const [discoverJobs, setDiscoverJobs] = useState<DiscoverJob[]>(MOCK_DISCOVER_JOBS);
  const [savedDiscoverIds, setSavedDiscoverIds] = useState<string[]>([]);
  const [passedDiscoverIds, setPassedDiscoverIds] = useState<string[]>([]);
  const [discoverRefreshKey, setDiscoverRefreshKey] = useState(0);
  const [isRefreshingDiscover, setIsRefreshingDiscover] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>(defaultIntegrations);
  const [integrationBusy, setIntegrationBusy] = useState<IntegrationProvider | null>(null);
  const [chartView, setChartView] = useState<ChartView>("donut");
  const [sortField, setSortField] = useState<SortField>("progress");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [dashboardFilters, setDashboardFilters] = useState<DashboardFilters>(
    DEFAULT_DASHBOARD_FILTERS,
  );
  const [chartSelection, setChartSelection] = useState<ChartSelection>({
    status: null,
    source: null,
  });
  const [listFilters, setListFilters] = useState<ListFilters>(DEFAULT_LIST_FILTERS);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [databaseMode, setDatabaseMode] = useState(false);
  const [notifyOnStatusChange, setNotifyOnStatusChange] = useState(true);
  const [lastDiscoverSwipe, setLastDiscoverSwipe] = useState<{
    jobId: string;
    action: "save" | "pass";
    applicationId?: string;
  } | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const profileSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileGeocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = loadState();

    const savedPlatformJobs = saved.platformJobs ?? [];
    const savedDiscoverIds = sanitizeDiscoverIds(saved.savedDiscoverIds, savedPlatformJobs);
    const passedDiscoverIds = sanitizeDiscoverIds(saved.passedDiscoverIds, savedPlatformJobs);
    const initialPool = [...MOCK_DISCOVER_JOBS, ...savedPlatformJobs];

    if (countActiveDiscoverJobs(savedDiscoverIds, passedDiscoverIds, initialPool) === 0) {
      setSavedDiscoverIds([]);
      setPassedDiscoverIds([]);
      setDiscoverJobs(resetDiscoverDeck());
    } else {
      setSavedDiscoverIds(savedDiscoverIds);
      setPassedDiscoverIds(passedDiscoverIds);
    }

    if (saved.integrations) setIntegrations(saved.integrations);
    if (saved.chartView) setChartView(saved.chartView);
    if (saved.sortField) setSortField(saved.sortField);
    if (saved.sortDirection) setSortDirection(saved.sortDirection);
    if (saved.dashboardFilters) {
      setDashboardFilters({ ...DEFAULT_DASHBOARD_FILTERS, ...saved.dashboardFilters });
    }
    if (saved.chartSelection) setChartSelection(saved.chartSelection);
    if (saved.listFilters) {
      setListFilters({ ...DEFAULT_LIST_FILTERS, ...saved.listFilters });
    }
    if (saved.profile) setProfile(saved.profile);
    if (saved.platformJobs) setPlatformJobs(saved.platformJobs);
    setOnboardingComplete(readOnboardingComplete());

    void fetchMe()
      .then((me) => {
        if (me.database) {
          setDatabaseMode(true);
          if (me.user) {
            setUser(me.user);
            if (me.user.notifyOnStatusChange !== undefined) {
              setNotifyOnStatusChange(me.user.notifyOnStatusChange);
            }
            if (me.profile) setProfile(me.profile);
            if (me.applications) setApplications(me.applications);
            return;
          }
          setUser(null);
          if (saved.applications) setApplications(saved.applications);
          return;
        }

        setDatabaseMode(false);
        if (saved.user) setUser(saved.user);
        if (saved.applications) setApplications(saved.applications);
      })
      .catch(() => {
        if (saved.user) setUser(saved.user);
        if (saved.applications) setApplications(saved.applications);
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void fetchIntegrationStatuses()
      .then(({ integrations: serverIntegrations }) => {
        setIntegrations((prev) =>
          prev.map((entry) => {
            const remote = serverIntegrations.find((item) => item.provider === entry.provider);
            if (!remote) return entry;
            return {
              ...entry,
              ...statusToIntegrationConnection(remote),
              applicationCount: entry.applicationCount,
              availableJobCount: entry.availableJobCount,
            };
          }),
        );
      })
      .catch(() => {
        /* offline or API unavailable — keep local state */
      });
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || databaseMode) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user,
        applications,
        savedDiscoverIds,
        passedDiscoverIds,
        integrations,
        chartView,
        sortField,
        sortDirection,
        dashboardFilters,
        chartSelection,
        listFilters,
        profile,
        platformJobs,
      }),
    );
  }, [
    hydrated,
    databaseMode,
    user,
    applications,
    savedDiscoverIds,
    passedDiscoverIds,
    integrations,
    chartView,
    sortField,
    sortDirection,
    dashboardFilters,
    chartSelection,
    listFilters,
    profile,
    platformJobs,
  ]);

  const completeOnboarding = useCallback(() => {
    setOnboardingComplete(true);
    writeOnboardingComplete(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginWithApi(email, password);
    setDatabaseMode(true);
    setUser(result.user);
    setProfile(result.profile);
    setApplications(result.applications);
    setNotifyOnStatusChange(result.user.notifyOnStatusChange);
  }, []);

  const signup = useCallback(async (email: string, name: string, password: string) => {
    const result = await signupWithApi(email, name, password);
    setDatabaseMode(true);
    setUser(result.user);
    setProfile(result.profile);
    setApplications(result.applications);
    setNotifyOnStatusChange(true);
  }, []);

  const logout = useCallback(async () => {
    if (databaseMode) {
      await logoutWithApi();
    }
    setUser(null);
  }, [databaseMode]);

  const setProfileState = useCallback(
    (next: UserProfile) => {
      setProfile(next);

      if (profileGeocodeTimerRef.current) clearTimeout(profileGeocodeTimerRef.current);
      if (next.location.trim() && next.latitude == null) {
        profileGeocodeTimerRef.current = setTimeout(() => {
          void geocodeLocationApi(
            formatLocationDisplay(next.location, next.zipCode),
          ).then((geo) => {
            if (!geo) return;
            setProfile((prev) =>
              prev.location === next.location
                ? { ...prev, latitude: geo.latitude, longitude: geo.longitude }
                : prev,
            );
          });
        }, 800);
      }

      if (profileSaveTimerRef.current) clearTimeout(profileSaveTimerRef.current);
      profileSaveTimerRef.current = setTimeout(() => {
        const snapshot = next;
        if (databaseMode && user) {
          void saveProfileApi(snapshot, notifyOnStatusChange)
            .then((result) => {
              setProfile((prev) => {
                const unchanged =
                  prev.location === snapshot.location &&
                  prev.rolePreference === snapshot.rolePreference &&
                  prev.openToRemote === snapshot.openToRemote &&
                  prev.skills.length === snapshot.skills.length &&
                  prev.skills.every((skill, index) => skill === snapshot.skills[index]);
                return unchanged ? result.profile : prev;
              });
            })
            .catch(() => undefined);
        }
      }, 600);
    },
    [databaseMode, user, notifyOnStatusChange],
  );

  const setNotifyOnStatusChangeState = useCallback(
    (value: boolean) => {
      setNotifyOnStatusChange(value);
      if (databaseMode && user) {
        void saveProfileApi(profile, value).catch(() => undefined);
      }
    },
    [databaseMode, user, profile],
  );
  const toggleSortDirection = useCallback(
    () => setSortDirection((d) => (d === "asc" ? "desc" : "asc")),
    [],
  );
  const clearChartSelection = useCallback(
    () => setChartSelection({ status: null, source: null }),
    [],
  );
  const resetListFilters = useCallback(() => setListFilters(DEFAULT_LIST_FILTERS), []);

  const applySyncResult = useCallback(
    (result: Awaited<ReturnType<typeof syncIntegrationApi>>) => {
      setApplications((prev) => mergeApplications(prev, result.applications));
      setPlatformJobs((prev) => mergePlatformJobs(prev, result.provider, result.availableJobs));
      setIntegrations((prev) =>
        prev.map((entry) =>
          entry.provider === result.provider
            ? {
                ...entry,
                connected: true,
                mode: result.mode as IntegrationMode,
                email: result.email ?? entry.email,
                lastSyncedAt: result.syncedAt,
                applicationCount: result.applications.length,
                availableJobCount: result.availableJobs.length,
              }
            : entry,
        ),
      );
    },
    [],
  );

  const connectIntegration = useCallback((provider: IntegrationProvider) => {
    startIntegrationConnect(provider);
  }, []);

  const syncIntegration = useCallback(
    async (provider: IntegrationProvider) => {
      setIntegrationBusy(provider);
      try {
        const result = await syncIntegrationApi(provider);
        applySyncResult(result);
      } finally {
        setIntegrationBusy(null);
      }
    },
    [applySyncResult],
  );

  const disconnectIntegration = useCallback(async (provider: IntegrationProvider) => {
    setIntegrationBusy(provider);
    try {
      await disconnectIntegrationApi(provider);
      setIntegrations((prev) =>
        prev.map((entry) =>
          entry.provider === provider ? { provider, connected: false } : entry,
        ),
      );
      setPlatformJobs((prev) => prev.filter((job) => job.source !== provider));
      setApplications((prev) => prev.filter((app) => app.source !== provider));
    } finally {
      setIntegrationBusy(null);
    }
  }, []);

  const discoverPool = useMemo(() => {
    const seen = new Set<string>();
    const merged: DiscoverJob[] = [];
    for (const job of [...discoverJobs, ...platformJobs]) {
      if (seen.has(job.id)) continue;
      seen.add(job.id);
      merged.push(job);
    }
    return merged;
  }, [discoverJobs, platformJobs]);

  const swipeDiscoverJob = useCallback((jobId: string, action: "save" | "pass") => {
    if (action === "save") {
      setSavedDiscoverIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
      const job = discoverPool.find((entry) => entry.id === jobId);
      if (job) {
        const payload: Omit<JobApplication, "id"> = {
          company: job.company,
          title: job.title,
          location: job.location,
          source: (job.source as JobSource) ?? "discover",
          status: "applied",
          appliedAt: new Date().toISOString().split("T")[0],
          salary: job.salary,
          url: job.url,
          companyDomain: job.companyDomain,
          logoUrl: job.logoUrl,
        };

        if (databaseMode && user) {
          void createApplicationApi(payload)
            .then((created) => {
              setApplications((prev) => [created, ...prev]);
              setLastDiscoverSwipe({ jobId, action, applicationId: created.id });
            })
            .catch((error) => {
              if (isUnauthorizedError(error)) {
                setUser(null);
                const applicationId = crypto.randomUUID();
                setApplications((prev) => [{ ...payload, id: applicationId }, ...prev]);
                setLastDiscoverSwipe({ jobId, action, applicationId });
                return;
              }
              setSavedDiscoverIds((prev) => prev.filter((id) => id !== jobId));
            });
          return;
        }

        const applicationId = crypto.randomUUID();
        setApplications((prev) => [{ ...payload, id: applicationId }, ...prev]);
        setLastDiscoverSwipe({ jobId, action, applicationId });
        return;
      }
    } else {
      setPassedDiscoverIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
    }
    setLastDiscoverSwipe({ jobId, action });
  }, [databaseMode, discoverPool, user]);

  const undoDiscoverSwipe = useCallback(() => {
    if (!lastDiscoverSwipe) return;
    const { jobId, action, applicationId } = lastDiscoverSwipe;
    if (action === "save") {
      setSavedDiscoverIds((prev) => prev.filter((id) => id !== jobId));
      if (applicationId) {
        if (databaseMode && user) {
          void deleteApplicationApi(applicationId).catch(() => {});
        }
        setApplications((prev) => prev.filter((app) => app.id !== applicationId));
      }
    } else {
      setPassedDiscoverIds((prev) => prev.filter((id) => id !== jobId));
    }
    setLastDiscoverSwipe(null);
  }, [databaseMode, lastDiscoverSwipe, user]);

  const refreshDiscoverJobs = useCallback(() => {
    setIsRefreshingDiscover(true);
    setSavedDiscoverIds([]);
    setPassedDiscoverIds([]);
    setLastDiscoverSwipe(null);

    void searchJobsApi({
      location: profile.location,
      query: profile.rolePreference,
      radius: 25,
      openToRemote: profile.openToRemote,
    })
      .then((result) => {
        const jobs =
          result.jobs.length > 0 ? shuffleDiscoverJobs(result.jobs) : resetDiscoverDeck();
        setDiscoverJobs(jobs.length > 0 ? jobs : resetDiscoverDeck());
        if (result.geocoded) {
          setProfile((prev) => ({
            ...prev,
            latitude: result.geocoded!.latitude,
            longitude: result.geocoded!.longitude,
          }));
        }
        setDiscoverRefreshKey((key) => key + 1);
      })
      .catch(() => {
        setDiscoverJobs(resetDiscoverDeck());
        setDiscoverRefreshKey((key) => key + 1);
      })
      .finally(() => {
        window.setTimeout(() => setIsRefreshingDiscover(false), 500);
      });
  }, [profile.location, profile.rolePreference, profile.openToRemote]);

  const addApplication = useCallback(
    async (job: Omit<JobApplication, "id">) => {
      const stored = normalizeLocationStorage({
        label: job.location,
        zipCode: job.zipCode,
      });
      let payload: Omit<JobApplication, "id"> = {
        ...job,
        location: stored.location,
        ...(stored.zipCode ? { zipCode: stored.zipCode } : {}),
      };

      if (
        payload.location.trim() &&
        payload.location !== "—" &&
        !/remote/i.test(payload.location) &&
        payload.latitude == null
      ) {
        const geo = await geocodeLocationApi(
          formatLocationDisplay(payload.location, payload.zipCode),
        );
        if (geo) {
          const geoStored = normalizeLocationStorage({ label: geo.displayName });
          payload = {
            ...payload,
            location: geoStored.location,
            ...(geoStored.zipCode ? { zipCode: geoStored.zipCode } : {}),
            latitude: geo.latitude,
            longitude: geo.longitude,
          };
        }
      }

      if (databaseMode && user) {
        try {
          const created = await createApplicationApi(payload);
          setApplications((prev) => [created, ...prev]);
          return;
        } catch (error) {
          if (!isUnauthorizedError(error)) throw error;
          setUser(null);
        }
      }
      setApplications((prev) => [{ ...payload, id: crypto.randomUUID() }, ...prev]);
    },
    [databaseMode, user],
  );

  const updateApplicationStatus = useCallback(
    async (id: string, status: JobApplication["status"]) => {
      if (databaseMode && user) {
        try {
          const updated = await patchApplicationStatus(id, status);
          setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
          return;
        } catch (error) {
          if (!isUnauthorizedError(error)) throw error;
          setUser(null);
        }
      }
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    },
    [databaseMode, user],
  );

  const updateApplicationNotes = useCallback(
    async (id: string, notes: string | null) => {
      if (databaseMode && user) {
        try {
          const updated = await patchApplicationNotes(id, notes);
          setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
          return;
        } catch (error) {
          if (!isUnauthorizedError(error)) throw error;
          setUser(null);
        }
      }
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, notes: notes ?? undefined } : a)),
      );
    },
    [databaseMode, user],
  );

  const deleteApplication = useCallback(
    async (id: string) => {
      if (databaseMode && user) {
        try {
          await deleteApplicationApi(id);
        } catch (error) {
          if (!isUnauthorizedError(error)) throw error;
          setUser(null);
        }
      }
      setApplications((prev) => prev.filter((a) => a.id !== id));
    },
    [databaseMode, user],
  );

  const dashboardApplications = useMemo(
    () => filterDashboardApps(applications, dashboardFilters, chartSelection, profile),
    [applications, dashboardFilters, chartSelection, profile],
  );

  const filteredApplications = useMemo(
    () => filterListApps(applications, listFilters),
    [applications, listFilters],
  );

  const sortedApplications = useMemo(() => {
    const sorted = [...filteredApplications];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortField === "progress") {
        cmp = STATUS_PROGRESS_ORDER[a.status] - STATUS_PROGRESS_ORDER[b.status];
      } else if (sortField === "appliedAt") cmp = a.appliedAt.localeCompare(b.appliedAt);
      else if (sortField === "company") cmp = a.company.localeCompare(b.company);
      else if (sortField === "title") cmp = a.title.localeCompare(b.title);
      else cmp = a.status.localeCompare(b.status);
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredApplications, sortField, sortDirection]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const app of applications) {
      counts[app.status] = (counts[app.status] ?? 0) + 1;
    }
    return counts;
  }, [applications]);

  const statusGroupCounts = useMemo(
    () => countByStatusGroup(dashboardApplications),
    [dashboardApplications],
  );

  const sourceCounts = useMemo(() => {
    const counts = {} as Record<JobSource, number>;
    for (const app of applications) {
      counts[app.source] = (counts[app.source] ?? 0) + 1;
    }
    return counts;
  }, [applications]);

  const dashboardStats = useMemo(() => {
    const interview = dashboardApplications.filter((a) =>
      ["phone_screen", "technical", "onsite", "final_round"].includes(a.status),
    ).length;
    const offers = dashboardApplications.filter((a) =>
      ["offer", "accepted"].includes(a.status),
    ).length;
    const rejected = dashboardApplications.filter((a) => a.status === "rejected").length;
    const responded = dashboardApplications.filter((a) => a.status !== "applied").length;
    const responseRate =
      dashboardApplications.length > 0
        ? (responded / dashboardApplications.length) * 100
        : 0;

    return {
      total: dashboardApplications.length,
      interview,
      offers,
      rejected,
      responseRate,
    };
  }, [dashboardApplications]);

  const activeDiscoverJobs = useMemo(
    () =>
      discoverPool.filter(
        (job) => !savedDiscoverIds.includes(job.id) && !passedDiscoverIds.includes(job.id),
      ),
    [discoverPool, savedDiscoverIds, passedDiscoverIds],
  );

  const nearbyJobs = useMemo(
    () => getNearbyJobsForProfile(activeDiscoverJobs, profile, 4),
    [activeDiscoverJobs, profile],
  );

  const value: AppContextValue = {
    user,
    applications,
    platformJobs,
    discoverJobs: activeDiscoverJobs,
    savedDiscoverIds,
    passedDiscoverIds,
    integrations,
    chartView,
    sortField,
    sortDirection,
    dashboardFilters,
    chartSelection,
    listFilters,
    profile,
    onboardingComplete,
    completeOnboarding,
    hydrated,
    databaseMode,
    notifyOnStatusChange,
    setNotifyOnStatusChange: setNotifyOnStatusChangeState,
    login,
    logout,
    signup,
    setProfile: setProfileState,
    setChartView,
    setSortField,
    setSortDirection,
    toggleSortDirection,
    setDashboardFilters,
    setChartSelection,
    clearChartSelection,
    setListFilters,
    resetListFilters,
    connectIntegration,
    disconnectIntegration,
    syncIntegration,
    integrationBusy,
    swipeDiscoverJob,
    undoDiscoverSwipe,
    canUndoDiscover: lastDiscoverSwipe !== null,
    refreshDiscoverJobs,
    discoverRefreshKey,
    isRefreshingDiscover,
    addApplication,
    updateApplicationStatus,
    updateApplicationNotes,
    deleteApplication,
    dashboardApplications,
    sortedApplications,
    filteredApplications,
    statusCounts,
    statusGroupCounts,
    sourceCounts,
    dashboardStats,
    nearbyJobs,
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-black">
        <p className="brutal-heading text-lg">Loading…</p>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
