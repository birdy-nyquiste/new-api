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
import { useEffect, useMemo } from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { getUserModels } from '@/lib/api'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ComboboxInput } from '@/components/ui/combobox-input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  SettingsForm,
  SettingsSwitchContent,
  SettingsSwitchItem,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'

// Form field names use a nested object (react-hook-form treats dots in
// names as nested paths); values are mapped back to dotted option keys
// on submit, mirroring auth/passkey-section.tsx.
const modelLabSchema = z.object({
  model_lab_setting: z.object({
    evaluation_enabled: z.boolean(),
    evaluation_model: z.string(),
    evaluation_prompt: z.string(),
  }),
})

type ModelLabFormValues = z.infer<typeof modelLabSchema>

type ModelLabSettingValues = {
  'model_lab_setting.evaluation_enabled': boolean
  'model_lab_setting.evaluation_model': string
  'model_lab_setting.evaluation_prompt': string
}

type ModelLabSectionProps = {
  defaultValues: ModelLabSettingValues
}

function toFormValues(defaults: ModelLabSettingValues): ModelLabFormValues {
  return {
    model_lab_setting: {
      evaluation_enabled: defaults['model_lab_setting.evaluation_enabled'],
      evaluation_model: defaults['model_lab_setting.evaluation_model'] ?? '',
      evaluation_prompt: defaults['model_lab_setting.evaluation_prompt'] ?? '',
    },
  }
}

function toOptionEntries(values: ModelLabFormValues): ModelLabSettingValues {
  return {
    'model_lab_setting.evaluation_enabled':
      values.model_lab_setting.evaluation_enabled,
    'model_lab_setting.evaluation_model':
      values.model_lab_setting.evaluation_model,
    'model_lab_setting.evaluation_prompt':
      values.model_lab_setting.evaluation_prompt,
  }
}

export function ModelLabSection({ defaultValues }: ModelLabSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const { data: modelsData } = useQuery({
    queryKey: ['user-models'],
    queryFn: getUserModels,
    staleTime: 5 * 60 * 1000,
  })
  const modelOptions = useMemo(
    () => (modelsData?.data ?? []).map((m) => ({ value: m, label: m })),
    [modelsData?.data]
  )
  const form = useForm<ModelLabFormValues>({
    resolver: zodResolver(modelLabSchema),
    defaultValues: toFormValues(defaultValues),
  })

  useEffect(() => {
    form.reset(toFormValues(defaultValues))
  }, [defaultValues, form])

  const onSubmit = async (values: ModelLabFormValues) => {
    const updates = Object.entries(toOptionEntries(values)).filter(
      ([key, value]) =>
        value !== defaultValues[key as keyof ModelLabSettingValues]
    )

    for (const [key, value] of updates) {
      await updateOption.mutateAsync({ key, value })
    }
  }

  return (
    <SettingsSection title={t('Model Lab')}>
      <Form {...form}>
        <SettingsForm onSubmit={form.handleSubmit(onSubmit)}>
          <SettingsPageFormActions
            onSave={form.handleSubmit(onSubmit)}
            isSaving={updateOption.isPending}
            saveLabel='Save Model Lab settings'
          />
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='model_lab_setting.evaluation_enabled'
              render={({ field }) => (
                <SettingsSwitchItem>
                  <SettingsSwitchContent>
                    <FormLabel>{t('Enable compare evaluation')}</FormLabel>
                    <FormDescription>
                      {t(
                        'Lets users ask a judge model to evaluate the responses of a compare round. The evaluation is billed to the user.'
                      )}
                    </FormDescription>
                  </SettingsSwitchContent>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </SettingsSwitchItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='model_lab_setting.evaluation_model'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Judge model')}</FormLabel>
                <FormControl>
                  <ComboboxInput
                    options={modelOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('Select or enter model name')}
                    emptyText={t('No models found')}
                    allowCustomValue
                  />
                </FormControl>
                <FormDescription>
                  {t(
                    'Model used to evaluate compare responses. It must be available to the requesting user.'
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='model_lab_setting.evaluation_prompt'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Evaluation prompt')}</FormLabel>
                <FormControl>
                  <Textarea rows={10} {...field} />
                </FormControl>
                <FormDescription>
                  {t(
                    'System prompt for the judge model. The responses are sent blind, labeled Response 1/2/3. Leave blank to use the built-in default prompt. This prompt is never shown to users.'
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </SettingsForm>
      </Form>
    </SettingsSection>
  )
}
