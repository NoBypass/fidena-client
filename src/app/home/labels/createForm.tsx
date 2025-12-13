"use client"

import {Dispatch, SetStateAction, useState} from "react";
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
import {cn, possibleStyles, styleKeys} from "@/lib/utils";
import {FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Check} from "lucide-react";
import {LabelDTO} from "@/app/api/labels/route";

const formSchema = z.object({
  name: z.string().min(1, "Label name is required"),
  color: z.string()
})

export default function CreateLabelForm({ setLabels }: { setLabels: Dispatch<SetStateAction<LabelDTO[]>>}) {
  // eslint-disable-next-line react-hooks/purity
  const random = Math.floor(Math.random() * styleKeys.length)
  const [selectedColor, setSelectedColor] = useState(random)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: possibleStyles[styleKeys[random]]
    }
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setLabels((prev) => ([
      ...prev,
      {
        id: -1,
        name: data.name,
        color: data.color
      }
    ]))

    fetch("/api/labels", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: data.name,
        color: data.color
      })
    }).then(res => res.json())
      .then(res => {
        if (res.labelId) {
          setLabels((prev) => ([
            ...prev.filter(label => label.id !== -1),
            {
              id: res.labelId,
              name: data.name,
              color: data.color
            }
          ]))
        }
      })
      .catch(console.error)
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader className="flex w-full justify-between mb-8">
        <DialogTitle>Create a new Label</DialogTitle>
        <DialogDescription>
          Labels are used to organize your transactions. Common examples include &#34;Food&#34;, &#34;Groceries&#34;, &#34;Entertainment&#34;, &#34;Utilities&#34;, etc.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Food" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FieldGroup>
            <FieldSet>
              <RadioGroup className="flex flex-wrap gap-1 rounded-none">
                {Object.entries(possibleStyles).map(([key, style], index) => (
                  <FieldLabel className="outline-black relative" key={index} htmlFor={index.toString()}>
                    <div className={cn("border rounded-sm w-8 h-8", style)}>
                      <RadioGroupItem id={index.toString()}
                                      onClick={() => {
                                        setSelectedColor(index)
                                        form.setValue("color", key)
                                      }}
                                      className="hidden"
                                      value={key} />
                      {index === selectedColor && <Check className="w-4 h-4 text-white absolute top-2 left-2" />}
                    </div>
                  </FieldLabel>
                ))}
              </RadioGroup>
            </FieldSet>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit">Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}