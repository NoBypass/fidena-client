import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {CheckIcon, ChevronsUpDownIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import { useEffect, useState } from "react";

export type Currency = {
  id: string;
  name: string;
  symbol: string;
};

type CurrencySelectProps = {
  selectedCurrency: Currency | undefined;
  setSelectedCurrency: (currency: Currency | undefined) => void;
  className?: string;
};

export function CurrencySelect({selectedCurrency, setSelectedCurrency, className}: CurrencySelectProps) {
  const [open, setOpen] = useState(false)
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    async function loadCurrencies() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/currencies", {
          method: "GET",
          credentials: "include",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`Failed to fetch currencies: ${res.status}`);
        const data: Currency[] = await res.json();
        setCurrencies(data || []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message ?? "Failed to fetch currencies");
        }
      } finally {
        setLoading(false);
      }
    }

    loadCurrencies();
    return () => ac.abort();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className || "")}
        >
          {selectedCurrency
            ? currencies.find((c) => c.id === selectedCurrency.id)?.id
            : loading
              ? "Loading..."
              : "Select currency..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandList>
            <CommandEmpty>{error ?? "No currency found."}</CommandEmpty>
            <CommandGroup>
              {currencies.map((currency) => (
                <CommandItem
                  keywords={[currency.id, currency.name, currency.symbol]}
                  key={currency.id}
                  value={currency.id}
                  onSelect={() => setSelectedCurrency(currency)}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCurrency?.id === currency.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {currency.id}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}