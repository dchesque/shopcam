import { render, screen, fireEvent } from "@testing-library/react"
import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders button with default props", () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole("button")
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent("Click me")
    expect(button).toHaveClass("bg-gradient-to-r", "from-red-500", "to-red-600")
  })

  it("renders different variants correctly", () => {
    const { rerender } = render(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole("button")).toHaveClass("border-neutral-700")

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole("button")).toHaveClass("hover:bg-neutral-800")

    rerender(<Button variant="danger">Danger</Button>)
    expect(screen.getByRole("button")).toHaveClass("text-red-500")
  })

  it("renders different sizes correctly", () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole("button")).toHaveClass("h-8", "px-3")

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole("button")).toHaveClass("h-12", "px-5")

    rerender(<Button size="xl">Extra Large</Button>)
    expect(screen.getByRole("button")).toHaveClass("h-14", "px-6")
  })

  it("handles disabled state", () => {
    render(<Button disabled>Disabled</Button>)

    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
    expect(button).toHaveClass("disabled:pointer-events-none", "disabled:opacity-50")
  })

  it("handles loading state", () => {
    render(<Button loading>Loading</Button>)

    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
    expect(button.querySelector("div")).toBeInTheDocument()
  })

  it("handles click events", () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole("button"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("does not call onClick when disabled", () => {
    const handleClick = jest.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )

    fireEvent.click(screen.getByRole("button"))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it("does not call onClick when loading", () => {
    const handleClick = jest.fn()
    render(
      <Button loading onClick={handleClick}>
        Loading
      </Button>
    )

    fireEvent.click(screen.getByRole("button"))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it("forwards ref correctly", () => {
    const ref = jest.fn()
    render(<Button ref={ref}>Button</Button>)

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement))
  })

  it("supports custom className", () => {
    render(<Button className="custom-class">Button</Button>)

    expect(screen.getByRole("button")).toHaveClass("custom-class")
  })
})
