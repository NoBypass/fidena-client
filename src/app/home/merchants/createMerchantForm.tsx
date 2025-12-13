"use client"

import {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {APIError, cn, possibleStyles, styleKeys} from "@/lib/utils";
import {FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {ArrowRight, Check, ImageIcon, Link2, Pencil, PlusCircleIcon, Upload, X} from "lucide-react";
import {LabelDTO} from "@/app/api/labels/route";
import {CreateMerchantFormValues, createMerchantSchema} from "@/lib/zodForms";
import {MerchantDTO} from "@/app/api/merchants/route";
import MerchantSelect from "@/app/home/transactions/new/merchantSelect";
import { Card } from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import LabelsSelect from "@/app/home/transactions/new/labelsSelect";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Label} from "@/components/ui/label";

const colors = {
  red: "bg-red-200",
  amber: "bg-amber-200",
  emerald: "bg-emerald-200",
  blue: "bg-blue-200",
  violet: "bg-violet-200",
  pink: "bg-pink-200",
  gray: "bg-gray-200",
}

type Props = {
}

export default function CreateMerchantForm({  }: Props) {
  const [selectedExistingMerchant, setSelectedExistingMerchant] = useState<MerchantDTO>()
  const [selectedLabels, setSelectedLabels] = useState<LabelDTO[]>([])
  const [name, setName] = useState("")
  const [selectedColor, setSelectedColor] = useState(colors.gray)
  const [uploadedImage, setUploadedImage] = useState<string>()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<CreateMerchantFormValues>({
    resolver: zodResolver(createMerchantSchema),
    defaultValues: {
      // TODO
    }
  })

  useEffect(() => {
    if (!selectedExistingMerchant) return
    form.setValue("name", selectedExistingMerchant.name)
  }, [selectedExistingMerchant, form]);

  function onSubmit(data: CreateMerchantFormValues) {
    // TODO
  }

  form.watch((data) => {
    setName(data.name || "")
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader className="flex w-full justify-between mb-4">
        <DialogTitle>Register a merchant</DialogTitle>
        <DialogDescription>
          Register a merchant to track your transactions with them. You can also select a pre-existing merchant from the list below.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <MerchantSelect
            presetOnly
            label={"Merchant Preset"}
            merchant={selectedExistingMerchant}
            setMerchant={setSelectedExistingMerchant}
            allowCreate={false} />

          <Card className="p-4 grid gap-4 items-center">
            <div className="w-full flex gap-2 items-center">
              <Avatar className="size-18 rounded-3xl">
                <AvatarImage src={uploadedImage }
                             alt="@shadcn" />

                <AvatarFallback className={`text-lg ${selectedColor}`}>
                  {name.length > 0 ? name[0] : "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1.5">
                {!uploadedImage && (
                  <div className="flex gap-1.5">
                    {Object.entries(colors).map(([color, style]) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(style)}
                        className={`${style} size-7 rounded-lg transition-all hover:scale-110`}
                      />
                    ))}
                  </div>
                )}

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                    id="image-upload"
                  />

                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedImage ? (
                        <>
                          <ImageIcon className="size-4" />
                          Change Image
                        </>
                      ) : (
                        <>
                          <Upload className="size-4" />
                          Upload Image
                        </>
                      )}
                    </Button>
                  </div>

                  {uploadedImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedImage(undefined)}
                      className="w-full mt-1"
                    >
                      Remove Image
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Spotify" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LabelsSelect labels={selectedLabels} setLabels={setSelectedLabels} />
          </Card>

          {/*TODO*/}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {/*<DialogClose asChild>*/}
              <Button type="submit">Register Merchant</Button>
            {/*</DialogClose>*/}
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}