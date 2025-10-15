"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LocationResult, useLocationSearch } from "@/hooks/use-location-search";
import { toast } from "sonner";

interface LocationComboboxProps {
  value: string; // O valor formatado (Ex: 'São Paulo, SP, Brasil')
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function LocationCombobox({
  value,
  onSelect,
  placeholder = "Buscar cidade, estado ou país...",
  disabled = false,
}: LocationComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value);
  const [results, setResults] = React.useState<LocationResult[]>([]);
  const { searchLocations, loading } = useLocationSearch();
  
  // Debounce para evitar chamadas excessivas à API
  const debouncedSearch = React.useCallback(
    (q: string) => {
      if (q.length >= 3) {
        searchLocations(q).then(setResults);
      } else {
        setResults([]);
      }
    },
    [searchLocations]
  );

  React.useEffect(() => {
    const handler = setTimeout(() => {
      debouncedSearch(query);
    }, 300); // 300ms de debounce

    return () => {
      clearTimeout(handler);
    };
  }, [query, debouncedSearch]);

  // Atualiza o estado interno quando o valor externo muda (ex: reset do form)
  React.useEffect(() => {
    if (value && value !== query) {
        setQuery(value);
    }
  }, [value]);


  const handleSelect = (location: LocationResult) => {
    const selectedLabel = location.label;
    onSelect(selectedLabel);
    setQuery(selectedLabel);
    setOpen(false);
    toast.success("Localização selecionada!", { description: selectedLabel });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <MapPin className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          {value ? value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
            className="h-9"
          />
          <CommandList>
            {loading && (
                <div className="p-2 text-center text-sm text-muted-foreground flex items-center justify-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Buscando...
                </div>
            )}
            {!loading && results.length === 0 && query.length >= 3 && (
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            )}
            {!loading && results.length === 0 && query.length < 3 && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                    Digite pelo menos 3 caracteres para buscar.
                </div>
            )}
            
            <CommandGroup>
              {results.map((location) => (
                <CommandItem
                  key={location.id}
                  value={location.label}
                  onSelect={() => handleSelect(location)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === location.label ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {location.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}