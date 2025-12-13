import {Currency} from "@/components/currencySelect";
import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {APIError, cn} from "@/lib/utils";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {CommandLoading} from "cmdk";

export type CurrencySelectHandle = {
  getCurrencies: () => readonly Currency[];
};

type Props = {
  currency: Currency|undefined;
  setCurrency: (id: Currency) => void;
};

const CurrencySelect = forwardRef<CurrencySelectHandle, Props>(function CurrencySelect(
  { currency, setCurrency },
  ref
) {
  const [open, setOpen] = useState(false)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)

  useImperativeHandle(
    ref,
    () => ({
      getCurrencies: () => currencies as readonly Currency[],
    }),
    [currencies]
  );

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
          console.error(err); // TODO handle this better (toast)
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          role="combobox"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-primary">
          {currency?.id || "Select currency..."}
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            {loading && <CommandLoading>Loading currencies...</CommandLoading>}
            <CommandGroup>
              {currencies.map((curr) => (
                <CommandItem
                  key={curr.id}
                  value={`${curr.id} ${curr.name}`}
                  onSelect={() => {
                    setCurrency(curr)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", currency?.id === curr.id ? "opacity-100" : "opacity-0")}
                  />
                  <span className="font-medium w-12">{curr.id}</span>
                  <span className="text-muted-foreground text-sm">{curr.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
});

export default CurrencySelect;
