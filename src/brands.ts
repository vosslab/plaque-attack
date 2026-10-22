// Domain tags have no runtime representation. Keep tagging casts in these constructors.
declare const domain: unique symbol;
type Brand<Name extends string> = number & { readonly [domain]: Name };

export type TargetId = Brand<"TargetId">;
export type ProjectileId = Brand<"ProjectileId">;
export type LogicalCoordinate = Brand<"LogicalCoordinate">;
export type DisplayCoordinate = Brand<"DisplayCoordinate">;
export type RandomSeed = Brand<"RandomSeed">;

export function targetId(value: number): TargetId {
  return value as TargetId;
}

export function projectileId(value: number): ProjectileId {
  return value as ProjectileId;
}

export function logicalCoordinate(value: number): LogicalCoordinate {
  return value as LogicalCoordinate;
}

export function displayCoordinate(value: number): DisplayCoordinate {
  return value as DisplayCoordinate;
}

export function randomSeed(value: number): RandomSeed {
  return value as RandomSeed;
}
