import { cn, formatNumber, formatCurrency, formatTimeAgo, isEmpty, truncate } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white")
  })

  it("drops falsy values", () => {
    expect(cn("bg-red-500", undefined, null, false && "hidden", "text-white")).toBe(
      "bg-red-500 text-white"
    )
  })

  it("prefers later tailwind tokens", () => {
    expect(cn("p-4", "p-2")).toBe("p-2")
  })
})

describe("formatNumber", () => {
  it("formats integers in pt-BR locale", () => {
    expect(formatNumber(1234567)).toBe("1.234.567")
  })

  it("keeps decimals", () => {
    expect(formatNumber(1234.56)).toBe("1.234,56")
  })
})

describe("formatCurrency", () => {
  it("formats BRL values", () => {
    const value = formatCurrency(1234.56)
    expect(value.startsWith("R$")).toBe(true)
    expect(value).toContain("1.234,56")
  })
})

describe("formatTimeAgo", () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date("2024-01-01T12:00:00Z"))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it("returns minutes for values under an hour", () => {
    const fifteenMinutesAgo = new Date("2024-01-01T11:45:00Z")
    expect(formatTimeAgo(fifteenMinutesAgo)).toBe("15m atr\u00E1s")
  })

  it("returns days for long intervals", () => {
    const twoDaysAgo = new Date("2023-12-30T12:00:00Z")
    expect(formatTimeAgo(twoDaysAgo)).toBe("2d atr\u00E1s")
  })
})

describe("isEmpty", () => {
  it("handles primitives and collections", () => {
    expect(isEmpty("")).toBe(true)
    expect(isEmpty([])).toBe(true)
    expect(isEmpty({})).toBe(true)
    expect(isEmpty({ foo: "bar" })).toBe(false)
  })
})

describe("truncate", () => {
  it("cuts long strings", () => {
    expect(truncate("abcdef", 4)).toBe("abcd...")
    expect(truncate("abc", 4)).toBe("abc")
  })
})
