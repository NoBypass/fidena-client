"use client"

import {useEffect, useState} from "react";
import {MerchantDTO} from "@/app/api/merchants/route";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {APIError} from "@/lib/utils";
import {Dialog, DialogTrigger} from "@/components/ui/dialog";
import CreateMerchantForm from "@/app/home/merchants/createMerchantForm";

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<MerchantDTO[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/merchants", {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json())
      .then((data: MerchantDTO[] | APIError) => {
        if ('error' in data) setError(data.error)
        else setMerchants(data as MerchantDTO[])
      })
      .catch((err) => setError(String(err)))
  }, []);

  return (
    <>
      <header className="flex items-center w-full justify-between mb-8">
        <h1 className="font-bold text-xl">Merchants</h1>
      </header>

      <Dialog>
        <DialogTrigger asChild>
          <Button>+ Create Merchant</Button>
        </DialogTrigger>
        <CreateMerchantForm />
      </Dialog>

      {error && <div className="text-destructive mb-4">{error}</div>}

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {merchants.map((m) => (
          <div key={m.id} className="flex items-center gap-4 p-4 rounded-md border">
            <Avatar className="h-10 w-10">
              <AvatarImage src={m.pfpLocation || "/placeholder.svg"} alt={m.name} />
              <AvatarFallback className="text-sm">{m.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{m.name}</div>
              {m.defaultLabels && m.defaultLabels.length > 0 && (
                <div className="flex gap-2 mt-1">
                  {m.defaultLabels.map((label, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded" style={{ backgroundColor: `${label.color}20`, color: label.color }}>{label.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </>
  )
}