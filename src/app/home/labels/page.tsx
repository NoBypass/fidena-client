"use client"

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogTrigger} from "@/components/ui/dialog";
import CreateLabelForm from "@/app/home/labels/createForm";
import {LabelDTO} from "@/app/api/labels/route";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Color, possibleStyles} from "@/lib/utils";
import {TrendingDown, TrendingUp} from "lucide-react";

export default function LabelsPage() {
  const [labels, setLabels] = useState<LabelDTO[]>([])

  useEffect(() => {
    fetch('/api/labels')
      .then(res => res.json())
      .then(labels => setLabels(labels))
      .catch(console.error)
  }, []);

  return (
    <>
      <header className="flex items-center w-full justify-between mb-8">
        <h1 className="font-bold text-xl">Labels</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>+ Create Label</Button>
          </DialogTrigger>
          <CreateLabelForm setLabels={setLabels} />
        </Dialog>
      </header>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {labels.map((label, index) => (
          <Card key={label.name} className="relative">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${possibleStyles[label.color as Color]}}`} />
                <CardTitle className="text-xl truncate">{label.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span>Spent</span>
                  </div>
                  <span className="font-semibold text-destructive">
                      0
                    </span>
                </div>

                {0 > 0 && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span>Income</span>
                    </div>
                    <span className="font-semibold text-emerald-600">
                        0
                      </span>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  0 Total Transactions
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
)
}