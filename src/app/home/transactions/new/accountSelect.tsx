import React, {useEffect, useState} from 'react';
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Building2, Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandGroup, CommandItem, CommandList} from "@/components/ui/command";
import {APIError, cn} from "@/lib/utils";
import {BankAccountDTO} from "@/app/api/bank-accounts/route";

type Props = {
  account: BankAccountDTO | undefined;
  setAccount: (account: BankAccountDTO) => void;
  setCurrencyCode: (currency: string) => void;
}

export default function AccountSelect({ account, setAccount, setCurrencyCode }: Props) {
  const [open, setOpen] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccountDTO[]>([])

  useEffect(() => {
    fetch("/api/bank-accounts", {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json())
      .then((data: BankAccountDTO[]|APIError) => {
        if ("error" in data) throw Error(data.error)
        else setBankAccounts(data)
      })
      .catch(console.error) // TODO handle this better (toast)
  }, []);

  const handleAccountSelect = (accountId: number) => {
    const account = bankAccounts.find((acc) => acc.id === accountId)
    if (account) {
      setAccount(account)
      setCurrencyCode(account.currency)
    }
    setOpen(false)
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        Bank Account <span className="text-destructive">*</span>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between bg-transparent">
            {account ? (
              <div className="flex items-center gap-2 truncate">
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{account.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select account...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                {bankAccounts.map((acc) => (
                  <CommandItem key={acc.id} value={acc.name} onSelect={() => handleAccountSelect(acc.id)}>
                    <Check
                      className={cn("mr-2 h-4 w-4", account?.id === acc.id ? "opacity-100" : "opacity-0")}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{acc.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {acc.accountNumber} • {acc.currency}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
