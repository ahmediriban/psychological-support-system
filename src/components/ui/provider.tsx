"use client"

import { ChakraProvider, defaultSystem, LocaleProvider } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

export function Provider({ locale, ...props }: ColorModeProviderProps & { locale: string }) {
  return (
    <LocaleProvider locale={locale}>
      <ChakraProvider value={defaultSystem}>
        <ColorModeProvider {...props} />
      </ChakraProvider>
    </LocaleProvider>
  )
}
