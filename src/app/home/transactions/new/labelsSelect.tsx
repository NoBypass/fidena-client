import React, {useEffect, useState} from 'react';
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Plus, X} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {APIError, cn} from "@/lib/utils";
import {LabelDTO} from "@/app/api/labels/route";

// TODO replace with tailwind colors and make it db compatible
const labelColors = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
]

type Props = {
  labels: LabelDTO[]
  setLabels: React.Dispatch<React.SetStateAction<LabelDTO[]>>
  merchantDefaultLabels: LabelDTO[]
  setMerchantDefaultLabels: React.Dispatch<React.SetStateAction<LabelDTO[]>>
};

// TODO make it so option to create new label doesnt only show when no other label can be matched for
export default function LabelsSelect({
  labels, setLabels,
  merchantDefaultLabels, setMerchantDefaultLabels,
}: Props) {
  const [open, setOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(labelColors[0])
  const [search, setSearch] = useState("")
  const [serverLabels, setServerLabels] = useState<LabelDTO[]>([])

  useEffect(() => {
    fetch("/api/labels", {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json())
      .then((data: LabelDTO[]|APIError) => {
        if ("error" in data) throw Error(data.error)
        else setServerLabels(data)
      })
      .catch(console.error) // TODO handle this better (toast)
  }, []);

  useEffect(() => {
    const merchantDefaultLabelsWithoutExisting = merchantDefaultLabels
      .filter((dLabel) => !labels.some((l) => l.name === dLabel.name))

    if (merchantDefaultLabelsWithoutExisting.length === merchantDefaultLabels.length) {
      setMerchantDefaultLabels(merchantDefaultLabelsWithoutExisting)
    } else {
      setLabels([...labels, ...merchantDefaultLabelsWithoutExisting])
    }
  }, [labels, merchantDefaultLabels, setLabels, setMerchantDefaultLabels]);

  const handleCreate = () => {
    if (search.trim() && !labels.some((label) => label.name === search)) {
      setLabels([...labels, { id: labels.length * -1, name: search.trim(), color: selectedColor }])
      setSearch("")
      setSelectedColor(labelColors[Math.floor(Math.random() * labelColors.length)])
      setOpen(false)
    }
  }

  const handleSelect = (label: LabelDTO) => {
    if (!labels.some((l) => l.name === label.name)) {
      setLabels([...labels, label])
    }
    setOpen(false)
    setSearch("")
  }

  const handleRemove = (labelName: string) => {
    setLabels(labels.filter((label) => label.name !== labelName))
    setMerchantDefaultLabels(merchantDefaultLabels.filter((l) => l.name !== labelName))
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-sm">Labels</Label>
      <div className="border rounded-lg p-3 space-y-2">
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {labels.map((label) => (
              <Badge
                key={label.name}
                variant="secondary"
                className="text-xs px-2 py-0.5 gap-1"
                style={{
                  backgroundColor: `${label.color}15`,
                  color: label.color,
                  borderColor: `${label.color}30`,
                }}
              >
                {label.name}
                <button
                  type="button"
                  onClick={() => handleRemove(label.name)}
                  className="hover:bg-black/10 rounded-full p-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="w-full gap-1.5 bg-transparent">
              <Plus className="h-3.5 w-3.5" />
              Add Label
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search or create..." value={search} onValueChange={setSearch} />
              <CommandList>
                <CommandEmpty>
                  <div className="py-4 px-3 space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">Create new label</p>
                    <div className="flex gap-1.5 mb-2">
                      {labelColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "w-5 h-5 rounded-full border-2",
                            selectedColor === color ? "border-foreground" : "border-transparent",
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <Button size="sm" onClick={handleCreate} className="w-full gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Create &#34;{search}&#34;
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {serverLabels.map((label) => (
                    <CommandItem
                      key={label.name}
                      value={label.name}
                      onSelect={() => handleSelect(label)}
                      className="flex items-center gap-2"
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }} />
                      <span className="text-sm">{label.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
