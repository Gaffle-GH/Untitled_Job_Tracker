import { distanceMiles } from "@/lib/geocode";
import {
  locationsRepresentSamePlace,
  profileLocationCity,
} from "@/lib/location-normalize";
import type { JobApplication, UserProfile } from "@/lib/types";

const DEFAULT_RADIUS_MILES = 50;

function isRemoteLocation(location: string) {
  return /remote/i.test(location);
}

export function applicationMatchesProfileLocation(
  app: JobApplication,
  profile: UserProfile,
  radiusMiles = DEFAULT_RADIUS_MILES,
) {
  if (!profile.location.trim()) return true;

  if (isRemoteLocation(app.location)) {
    return profile.openToRemote;
  }

  if (
    locationsRepresentSamePlace(app.location, profile.location, app.zipCode, profile.zipCode)
  ) {
    return true;
  }

  if (
    app.latitude != null &&
    app.longitude != null &&
    profile.latitude != null &&
    profile.longitude != null
  ) {
    return (
      distanceMiles(profile.latitude, profile.longitude, app.latitude, app.longitude) <=
      radiusMiles
    );
  }

  const city = profileLocationCity(profile);
  if (city && app.location.toLowerCase().includes(city)) return true;

  return false;
}

export function discoverJobMatchesProfileLocation(
  jobLocation: string,
  remote: boolean,
  profile: UserProfile,
) {
  if (!profile.location.trim()) return true;

  if (remote || isRemoteLocation(jobLocation)) {
    return profile.openToRemote;
  }

  if (locationsRepresentSamePlace(jobLocation, profile.location, undefined, profile.zipCode)) {
    return true;
  }

  const city = profileLocationCity(profile);
  if (city && jobLocation.toLowerCase().includes(city)) return true;

  return profile.latitude != null && profile.longitude != null;
}
