import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  TrendingUp
} from "lucide-react";

const stats = [
  {
    name: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
  },
  {
    name: "Active Users",
    value: "2,350",
    change: "+180.1%",
    trend: "up",
    icon: Users,
  },
  {
    name: "Sales",
    value: "+12,234",
    change: "+19%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    name: "Active Products",
    value: "573",
    change: "+201",
    trend: "up",
    icon: Package,
  },
];

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            Download Report
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-secondary rounded-lg">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span className={stat.trend === "up" ? "text-emerald-500 flex items-center text-xs font-semibold" : "text-rose-500 flex items-center text-xs font-semibold"}>
                {stat.change}
                {stat.trend === "up" ? <ArrowUpRight className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-4 p-6 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Revenue Growth
            </h3>
            <select className="bg-secondary border-none text-sm rounded-md px-2 py-1 outline-none font-medium appearance-none cursor-pointer">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-[300px] flex items-end justify-between space-x-2 pt-4">
            {[40, 70, 45, 90, 65, 80, 50, 85, 45, 75, 60, 95].map((height, i) => (
              <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm relative group" style={{ height: `${height}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ${(height * 100).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-muted-foreground font-medium px-1">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
        </div>

        <div className="md:col-span-3 p-6 bg-card border border-border rounded-xl flex flex-col">
          <h3 className="font-semibold text-lg mb-6">Recent Orders</h3>
          <div className="space-y-6 flex-1">
            {[
              { user: "Sarah Connor", email: "sarah@example.com", amount: "$250.00", status: "Paid" },
              { user: "John Doe", email: "john@example.com", amount: "$120.50", status: "Processing" },
              { user: "Michael Smith", email: "mike@example.com", amount: "$540.20", status: "Paid" },
              { user: "Emily Davis", email: "emily@example.com", amount: "$89.99", status: "Refunded" },
              { user: "Robert Wilson", email: "rob@example.com", amount: "$199.00", status: "Paid" },
            ].map((order, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-secondary/50 p-2 -m-2 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                    {order.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{order.user}</p>
                    <p className="text-xs text-muted-foreground mt-1">{order.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{order.amount}</p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mt-1",
                    order.status === "Paid" ? "text-emerald-500" :
                      order.status === "Processing" ? "text-amber-500" : "text-rose-500"
                  )}>{order.status}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg">
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
}
