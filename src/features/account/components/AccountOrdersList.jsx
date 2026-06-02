import chevronRightIcon from "../../../assets/account-orders/chevron-right.svg";
import orderBoxIcon from "../../../assets/account-orders/order-box.svg";
import { cn } from "../../../lib/cn.js";

const orderFilters = ["All", "Active", "Completed"];

const statusStyles = {
  progress: {
    icon: "bg-nucleotide-lavender",
    badge: "border-nucleotide-lavender bg-nucleotide-lavender text-nucleotide-purple",
  },
  complete: {
    icon: "bg-[#E6F6F3]",
    badge: "border-nucleotide-sea bg-[#E6F6F3] text-nucleotide-sea",
  },
};

function OrderStatusBadge({ order }) {
  const styles = statusStyles[order.statusTone] || statusStyles.progress;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border px-2.5 py-1 font-poppins text-[clamp(0.8125rem,0.74rem+0.28vw,1rem)] leading-[1.35]",
        styles.badge,
      )}
    >
      {order.status}
    </span>
  );
}

function OrderCard({ order }) {
  const styles = statusStyles[order.statusTone] || statusStyles.progress;

  return (
    <article className="grid gap-4 rounded-2xl border border-nucleotide-lavender bg-white px-[clamp(1rem,1.8vw,1.5rem)] py-[clamp(0.875rem,1.5vw,1.125rem)] shadow-[0_4px_13.65px_rgba(0,0,0,0.05)] xl:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)_2.5rem] xl:items-center">
      <div className="flex min-w-0 items-center gap-4">
        <span
          className={cn(
            "grid size-[clamp(3rem,3.2vw,3.5rem)] shrink-0 place-items-center rounded-full",
            styles.icon,
          )}
        >
          <img src={orderBoxIcon} alt="" className="size-[clamp(1.25rem,1.6vw,1.5rem)]" />
        </span>

        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <h3 className="font-poppins text-[clamp(1rem,0.92rem+0.28vw,1.25rem)] font-medium leading-[1.2] tracking-[-0.02em] text-nucleotide-ink">
              #{order.id}
            </h3>
            <OrderStatusBadge order={order} />
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-poppins text-[clamp(0.875rem,0.8rem+0.24vw,1rem)] leading-[1.45]">
            <span className="text-nucleotide-muted">{order.patients.join(", ")}</span>
            <span className="h-6 w-px bg-nucleotide-muted/30" aria-hidden="true" />
            <span className="text-nucleotide-night">{order.testName}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:gap-8">
        <div className="space-y-1.5 font-poppins text-[clamp(0.875rem,0.8rem+0.24vw,1rem)] leading-[1.45] xl:text-right">
          <p className="font-medium leading-[1.3] text-nucleotide-muted">Appointment</p>
          <div className="text-nucleotide-ink">
            <p>{order.appointmentDate}</p>
            <p>{order.appointmentTime}</p>
          </div>
        </div>

        <div className="space-y-1.5 font-poppins xl:text-right">
          <p className="text-[clamp(0.875rem,0.8rem+0.24vw,1rem)] font-medium leading-[1.3] text-nucleotide-muted">
            Total
          </p>
          <p className="text-[clamp(1.375rem,1.16rem+0.48vw,1.625rem)] font-semibold leading-none tracking-[-0.02em] text-nucleotide-ink">
            {order.total}
          </p>
        </div>
      </div>

      <a
        href="#"
        className="grid size-10 place-items-center justify-self-start rounded-full text-nucleotide-purple transition hover:bg-nucleotide-lavender/70 focus:outline-none focus:ring-4 focus:ring-nucleotide-lavender xl:justify-self-end"
        aria-label={`View order ${order.id}`}
      >
        <img src={chevronRightIcon} alt="" className="size-6" />
      </a>
    </article>
  );
}

export function AccountOrdersList({ orders }) {
  return (
    <section
      className="min-w-0 space-y-[clamp(1.75rem,3vw,2.5rem)] pt-[clamp(1.5rem,3vw,2.5rem)] lg:mt-[clamp(3rem,4.8vw,4.5rem)]"
      aria-label="Blood test orders"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-poppins text-[clamp(1.25rem,1rem+0.45vw,1.5rem)] font-medium leading-[1.125] tracking-[-0.02em] text-nucleotide-ink">
          Orders
        </h2>

        <div className="flex w-full gap-2 overflow-x-auto rounded-full border border-nucleotide-lavender bg-white p-2 shadow-[0_4px_13.65px_rgba(0,0,0,0.05)] sm:w-auto">
          {orderFilters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={cn(
                "shrink-0 rounded-full px-[clamp(1rem,2vw,1.5rem)] py-2 font-poppins text-[clamp(0.875rem,0.8rem+0.24vw,1rem)] font-medium leading-[1.3] transition",
                filter === "All"
                  ? "border border-nucleotide-lavender bg-white text-nucleotide-purple shadow-[0_4px_13.65px_rgba(0,0,0,0.05)]"
                  : "text-nucleotide-ink hover:bg-nucleotide-lavender/50",
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-[clamp(0.75rem,1.5vw,0.9375rem)]">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}
