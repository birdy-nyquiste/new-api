/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { MODEL_LAB_COMPARE_PATH } from '@/features/model-lab/constants'

export const DEFAULT_POST_SIGN_IN_REDIRECT = MODEL_LAB_COMPARE_PATH

export function resolvePostSignInRedirectTarget(redirectTo?: string): string {
  const target = redirectTo?.trim()
  return target || DEFAULT_POST_SIGN_IN_REDIRECT
}
