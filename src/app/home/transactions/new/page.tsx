"use client"

import {useEffect, useState} from "react";
import { Label } from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Paperclip,
  Upload,
  X
} from "lucide-react";
import {Textarea} from "@/components/ui/textarea";
import {Calendar} from "@/components/ui/calendar";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import AmountSelect from "@/app/home/transactions/new/amountSelect";
import AccountSelect from "@/app/home/transactions/new/accountSelect";
import {BankAccountDTO} from "@/app/api/bank-accounts/route";
import LabelsSelect from "@/app/home/transactions/new/labelsSelect";
import {LabelDTO} from "@/app/api/labels/route";
import MerchantSelect from "@/app/home/transactions/new/merchantSelect";
import {MerchantDTO} from "@/app/api/merchants/route";

export default function TransactionsPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<BankAccountDTO>()
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantDTO>()
  const [labels, setLabels] = useState<LabelDTO[]>([])
  const [merchantDefaultLabels, setMerchantDefaultLabels] = useState<LabelDTO[]>([])
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [currencyCode, setCurrencyCode] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setAttachedFile(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({
      title,
      date,
      description,
      amount,
      selectedAccount,
      selectedMerchant,
      labels,
      attachedFile,
    })
  }

  return (
    <>
      <header className="flex items-center w-full justify-between mb-8">
        <h1 className="font-bold text-xl">Add new Transaction</h1>
      </header>

      <section>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-[1fr,auto]">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Monthly groceries"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-sm">
                Date <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full md:w-[180px] justify-start", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MMM dd, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AccountSelect
              account={selectedAccount}
              setAccount={setSelectedAccount}
              setCurrencyCode={setCurrencyCode} />

            <AmountSelect
              amount={amount}
              setAmount={setAmount}
              selectedCurrencyCode={currencyCode} />
          </div>

          <MerchantSelect
            merchant={selectedMerchant}
            setMerchant={setSelectedMerchant}
            setMerchantDefaultLabels={setMerchantDefaultLabels}/>

          <LabelsSelect
            labels={labels}
            setLabels={setLabels}
            merchantDefaultLabels={merchantDefaultLabels}
            setMerchantDefaultLabels={setMerchantDefaultLabels}/>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm text-muted-foreground">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="file" className="text-sm font-medium">
              Attach File <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>

            {attachedFile ? (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-accent/50">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(attachedFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={removeFile} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Attach receipts, invoices, or other relevant documents</p>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Create Transaction
          </Button>
        </form>
      </section>
    </>
  )
}