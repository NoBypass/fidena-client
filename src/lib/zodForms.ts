import {z} from "zod";

export type CreateMerchantFormValues = z.infer<typeof createMerchantSchema>

export const createMerchantSchema = z.object({
  name: z.string().optional(),
  color: z.string().optional(),
  pfpLocation: z.string().optional(), // TODO implement image uploading
  underlyingMerchantId: z.string().optional(),

  defaultLabels: z.array(z.number()).optional(),
  newDefaultLabels: z.array(z.object({
    name: z.string(),
    color: z.string(),
  })).optional(),
})
  .superRefine((val, ctx) => {
    if (!val.underlyingMerchantId) {
      if (!val.color && !val.pfpLocation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Either color or profile picture must be provided if you're registering an entirely new merchant.",
        });
      }

      if (!val.name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Merchant name is required when registering a new merchant.",
        })
      }
    }
  });