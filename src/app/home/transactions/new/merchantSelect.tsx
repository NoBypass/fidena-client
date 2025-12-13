import React, {useEffect, useState} from 'react';
import {Label} from "@/components/ui/label";
import {Check, ChevronsUpDown, Plus, X} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {APIError, cn} from "@/lib/utils";
import {LabelDTO} from "@/app/api/labels/route";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {MerchantDTO} from "@/app/api/merchants/route";

type Props = {
  merchant: MerchantDTO | undefined;
  setMerchant: React.Dispatch<React.SetStateAction<MerchantDTO | undefined>>
  setMerchantDefaultLabels?: React.Dispatch<React.SetStateAction<LabelDTO[]>>
  allowCreate?: boolean
  label?: string
  presetOnly?: boolean
};

// TODO make it so option to create new label doesnt only show when no other label can be matched for
export default function MerchantSelect({
                                         merchant: selectedMerchant,
                                         setMerchant: setSelectedMerchant,
                                         setMerchantDefaultLabels,
                                         allowCreate = true,
                                         label = "Merchant",
                                         presetOnly = false,
                                       }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [serverMerchants, setServerMerchants] = useState<MerchantDTO[]>([])

  useEffect(() => {
    fetch(`/api/merchants${presetOnly ? "/presets" : ""}`, {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json())
      .then((data: MerchantDTO[]|APIError) => {
        if ("error" in data) throw Error(data.error)
        // else setServerMerchants(data)
        else setServerMerchants([{
          id: -1,
          name: "Test Merchant",
        }])
      })
      .catch(console.error) // TODO handle this better (toast)
  }, []);

  function handleMerchantSelect(merchant: MerchantDTO) {
    if (setMerchantDefaultLabels)
      setMerchantDefaultLabels(merchant.defaultLabels || [])
    setSelectedMerchant(merchant)
    setOpen(false)
  }

  function handleCreateMerchant() {
    if (search.trim()) {
      const newMerchant: MerchantDTO = {
        id: -1,
        name: search.trim(),
        defaultLabels: [],
      }

      handleMerchantSelect(newMerchant)
    }
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label} <span className="text-destructive">*</span>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between bg-transparent">
            {selectedMerchant ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={selectedMerchant.pfpLocation || "/placeholder.svg"}
                    alt={selectedMerchant.name}
                  />
                  <AvatarFallback className="text-xs">{selectedMerchant.name[0]}</AvatarFallback>
                </Avatar>
                <span>{selectedMerchant.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select {allowCreate && "or create"} merchant...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search or create..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">No merchant found.</p>
                  {allowCreate && <Button size="sm" onClick={handleCreateMerchant} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Create &#34;{search}&#34;
                  </Button>}
                {/*  TODO connect up  */}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {serverMerchants.map((m) => (
                  <CommandItem
                    key={m.id}
                    value={m.name}
                    keywords={[m.name, m.defaultLabels?.map((label) => label.name).join(" ") || ""]}
                    onSelect={() => handleMerchantSelect(m)}
                    className="flex items-center gap-2 py-2"
                  >
                    <Check
                      className={cn("h-4 w-4", selectedMerchant?.id === m.id ? "opacity-100" : "opacity-0")}
                    />
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={m.pfpLocation || "/placeholder.svg"} alt={m.name} />
                      <AvatarFallback className="text-xs">{m.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{m.name}</span>
                      {m.defaultLabels && m.defaultLabels.length > 0 && (
                        <div className="flex gap-1">
                          {m.defaultLabels.map((label, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `${label.color}20`,
                                color: label.color,
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      )}
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
