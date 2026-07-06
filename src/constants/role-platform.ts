export type RolePlatform = 'ERP' | 'APP' | 'INTERNAL';

export const ROLE_PLATFORM_OPTIONS: Array<{
  value: RolePlatform;
  label: string;
}> = [
  { value: 'ERP', label: 'ERP' },
  { value: 'APP', label: 'APP' },
  { value: 'INTERNAL', label: 'Interno' },
];

export function rolePlatformLabel(platform: RolePlatform): string {
  return ROLE_PLATFORM_OPTIONS.find((option) => option.value === platform)?.label ?? platform;
}
