'use client'

import { useCallback, useState } from 'react'

interface RulesProps {
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
}

export const Rules = ({ form, setForm }: RulesProps) => {
  const [ruleInput, setRuleInput] = useState('')

  const handleAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (ruleInput.trim() === '') return
      setForm((prev: any) => ({
        ...prev,
        rules: [...prev.rules, ruleInput.trim()],
      }))
      setRuleInput('')
    },
    [ruleInput, setForm],
  )

  const handleDelete = useCallback(
    (idx: number) => {
      setForm((prev: any) => ({
        ...prev,
        rules: prev.rules.filter((_: string, i: number) => i !== idx),
      }))
    },
    [setForm],
  )

  return (
    <>
      <div className='w-full h-fit flex flex-col gap-12 px-5 pt-4 pb-5'>
        <div className='text-xl font-bold'>
          객실 내 규율을
          <br />
          입력해주세요
        </div>

        <div className='flex flex-col gap-6 pb-24'>
          <form
            onSubmit={(e) => {
              handleAdd(e)
            }}
            className='w-full flex flex-col gap-2'
          >
            <input
              type='text'
              value={ruleInput}
              onChange={(e) => setRuleInput(e.target.value)}
              placeholder='규율을 입력하세요'
              className='w-full h-12 bg-stone-100 px-4 rounded-md focus:bg-stone-200 transition-all outline-none'
            />
            <button
              type='submit'
              className='px-4 py-2 bg-black text-white rounded-lg active:opacity-80 active:scale-95 transition-all'
            >
              추가
            </button>
          </form>

          <div className='flex flex-col gap-3'>
            <span className='text-sm font-medium text-black/50'>등록된 규율</span>
            <div className='flex flex-col gap-2'>
              {!Array.isArray(form.rules) || form.rules.length === 0 ? (
                <div className='text-sm text-stone-500 px-3 py-2'>아직 추가된 규율이 없어요.</div>
              ) : (
                form.rules.map((rule: string, idx: number) => (
                  <div
                    key={idx}
                    className='w-full h-12 flex flex-row justify-between items-center gap-2 bg-stone-100 rounded-md'
                  >
                    <div className='text-sm w-full flex justify-start items-center h-12 px-4'>{rule}</div>
                    <button
                      onClick={() => {
                        handleDelete(idx)
                      }}
                      className='text-red-500 w-fit flex-shrink-0 px-4 h-12 text-sm active:scale-90 transition-all'
                    >
                      삭제
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
