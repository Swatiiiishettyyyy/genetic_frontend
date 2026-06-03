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
    <article className="rounded-2xl border border-nucleotide-lavender/80 bg-white px-4 py-4 shadow-[0_4px_24px_rgba(16,17,41,0.06)]">
      {/* Top section: icon + details + chevron */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full",
            styles.icon,
          )}
        >
          <img src={orderBoxIcon} alt="" className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="min-w-0 truncate font-poppins text-[0.9375rem] font-semibold leading-snug text-nucleotide-ink">
              #{order.id}
            </h3>
            <OrderStatusBadge order={order} />
          </div>
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 font-poppins text-[0.8125rem] leading-snug">
            <span className="truncate text-nucleotide-muted">{order.patients.join(", ")}</span>
            <span className="h-3.5 w-px shrink-0 bg-nucleotide-muted/40" aria-hidden="true" />
            <span className="truncate text-nucleotide-ink">{order.testName}</span>
          </div>
        </div>

        <a
          href="#"
          className="grid size-8 shrink-0 place-items-center rounded-full text-nucleotide-purple transition hover:bg-nucleotide-lavender/60 focus:outline-none focus:ring-2 focus:ring-nucleotide-lavender"
          aria-label={`View order ${order.id}`}
        >
          <img src={chevronRightIcon} alt="" className="size-4" />
        </a>
      </div>

      {/* Divider */}
      <div className="my-3 h-px bg-nucleotide-lavender/50" />

      {/* Bottom section: appointment + total */}
      <div className="flex items-start justify-between">
        <div className="font-poppins">
          <p className="text-[0.75rem] font-medium text-nucleotide-muted">Appointment</p>
          <p className="mt-0.5 text-[0.8125rem] text-nucleotide-ink">{order.appointmentDate}</p>
          <p className="text-[0.8125rem] text-nucleotide-ink">{order.appointmentTime}</p>
        </div>

        <div className="text-right font-poppins">
          <p className="text-[0.75rem] font-medium text-nucleotide-muted">Total</p>
          <p className="mt-0.5 text-[1.25rem] font-semibold leading-none tracking-tight text-nucleotide-ink">
            {order.total}
          </p>
        </div>
      </div>
    </article>
  );
}

export function AccountOrdersList({ orders }) {
  return (
    <section
      className="min-w-0 space-y-[clamp(1.25rem,3vw,2.5rem)] pt-[clamp(1.75rem,2.4vw,2.25rem)] lg:mt-[clamp(3rem,4.8vw,4.5rem)]"
      aria-label="Blood test orders"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <h2 className="font-poppins text-[clamp(1.25rem,1rem+0.45vw,1.5rem)] font-medium leading-[1.125] text-nucleotide-ink">
            Order Management
          </h2>
          <p className="mt-2 font-poppins text-[clamp(0.8125rem,0.74rem+0.24vw,0.9375rem)] leading-[1.45] text-[#5f5f68]">
            Track and manage your diagnostic appointments.
          </p>
        </div>

        <div className="flex w-full gap-2 overflow-x-auto rounded-full border border-nucleotide-lavender bg-white p-2 shadow-[0_0.75rem_2rem_rgba(16,17,41,0.04)] sm:w-auto">
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
