import React, {useEffect, useRef, useState} from 'react';
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import {ArrowDownRight, ArrowUpRight} from "lucide-react";
import {Currency} from "@/components/currencySelect";
import CurrencySelect, {CurrencySelectHandle} from "@/app/home/transactions/new/currencySelect";

// TODO change to number
type Props = {
  amount: string
  setAmount: React.Dispatch<React.SetStateAction<string>>
  selectedCurrencyCode: string
}

export default function AmountSelect({ amount, setAmount, selectedCurrencyCode }: Props) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>()
  const [isExpense, setIsExpense] = useState(true)

  const currencySelectRef = useRef<CurrencySelectHandle|null>(null);

  function handleAmountChange(value: string) {
    if (value.startsWith("+")) {
      setIsExpense(false)
      setAmount(value.slice(1))
    } else if (value.startsWith("-")) {
      setIsExpense(true)
      setAmount(value.slice(1))
    } else {
      setAmount(value)
    }
  }

  useEffect(() => {
    const currencyFromProp = currencySelectRef.current
      ?.getCurrencies()
      .find(c => c.id === selectedCurrencyCode);

    if (!currencyFromProp) return;

    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setSelectedCurrency(prev =>
      prev?.id === currencyFromProp.id ? prev : currencyFromProp
    );
  }, [selectedCurrencyCode, setSelectedCurrency, currencySelectRef]);

  return (
    <div className="space-y-2">
      <Label htmlFor="amount" className="text-sm">
        Amount <span className="text-destructive">*</span>
      </Label>

      <div className="relative">
        <Input
          id="amount"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          required
          className={"pl-24 pr-20"} // TODO adjust pl based on symbol length
          startContent={
            <>
              <div className="absolute left-0 top-0 h-full flex items-center">
                <button
                  type="button"
                  onClick={() => setIsExpense(true)}
                  className={cn(
                    "h-full px-2.5 rounded-l-md flex items-center justify-center border-r transition-colors",
                    isExpense
                      ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted",
                  )}
                  title="Expense">
                  <ArrowDownRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpense(false)}
                  className={cn(
                    "h-full px-2.5 flex items-center justify-center border-r transition-colors",
                    !isExpense
                      ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted",
                  )}
                  title="Income">
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <p className="ml-3 text-muted-foreground font-medium">
                  {selectedCurrency?.symbol || ""}
                </p>
              </div>
            </>
          }
          endContent={
            <CurrencySelect
              currency={selectedCurrency}
              setCurrency={setSelectedCurrency}
              ref={currencySelectRef} />
          }
        />
      </div>
      <p className="text-xs text-muted-foreground">Tip: Type + or - to switch between income/expense</p>
    </div>
  );
}
