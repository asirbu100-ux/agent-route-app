import { z } from 'zod'

const soldSchema = z.object({
  result: z.literal('sold'),
  products: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive('Количество должно быть больше 0'),
      })
    )
    .min(1, 'Укажите хотя бы один товар'),
  agentComment: z.string().min(1, 'Комментарий обязателен'),
})

const notSoldSchema = z.object({
  result: z.literal('not_sold'),
  refusalReason: z.enum([
    'expensive',
    'not_needed',
    'no_space',
    'competitor',
    'no_decision_maker',
    'no_stock',
    'other',
  ]),
  refusalComment: z.string().optional(),
  agentComment: z.string().min(1, 'Комментарий обязателен'),
})

export const visitSubmitSchema = z
  .discriminatedUnion('result', [soldSchema, notSoldSchema])
  .superRefine((data, ctx) => {
    if (
      data.result === 'not_sold' &&
      data.refusalReason === 'other' &&
      (!data.refusalComment || data.refusalComment.trim().length === 0)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['refusalComment'],
        message: 'Опишите причину при выборе "Другое"',
      })
    }
  })

export type VisitSubmitPayload = z.infer<typeof visitSubmitSchema>
