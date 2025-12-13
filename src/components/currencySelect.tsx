import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {CheckIcon, ChevronsUpDownIcon} from "lucide-react";
import {APIError, cn} from "@/lib/utils";
import { useEffect, useState } from "react";

export type Currency = {
  id: string;
  name: string;
  symbol: string;
};

type CurrencySelectProps = {
  selectedCurrencyStr: string | undefined;
  setSelectedCurrency: (currency: Currency | undefined) => void;
  className?: string;
};

export function CurrencySelect({selectedCurrencyStr, setSelectedCurrency, className}: CurrencySelectProps) {
  const [open, setOpen] = useState(false)
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/currencies", {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json() as Promise<Currency[]|APIError>)
      .then((data) => {
        if ("error" in data) throw Error(data.error)

        setCurrencies(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message ?? "Failed to fetch currencies");
        }
      })
      .finally(() => setLoading(false));
    }, []);

  const selectedCurrency = currencies?.find((c) => c.id === selectedCurrencyStr)

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
                  onSelect={() => {
                    setOpen(false)
                    setSelectedCurrency(currency)
                  }}
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