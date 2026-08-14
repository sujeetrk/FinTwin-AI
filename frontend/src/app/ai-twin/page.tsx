"use client";

import Sidebar from "../../components/layout/Sidebar";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  CircleDollarSign,
  Goal,
  Lightbulb,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";


// =========================================================
// API
// =========================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";


// =========================================================
// TYPES
// =========================================================

interface Financials {
  total_income: number;
  total_expenses: number;
  balance: number;
  savings_rate: number;
  transaction_count: number;
}

interface MonthlyFinancials {
  month: number;
  year: number;
  income: number;
  expenses: number;
  balance: number;
}

interface Budgets {
  total_budget: number;
  spent: number;
  remaining: number;
  used_percentage: number;
  active_budgets: number;
  status: string;
}

interface Goals {
  total_target: number;
  total_saved: number;
  remaining: number;
  progress: number;
  active_goals: number;
  completed_goals: number;
}

interface HealthScore {
  score: number;
  rating: string;
}

interface Insight {
  type?: string;
  category?: string;
  title?: string;
  message?: string;
}

interface Recommendation {
  category?: string;
  title?: string;
  action?: string;
}

interface Risk {
  level?: string;
  category?: string;
  title?: string;
  message?: string;
}

interface Forecast {
  days_elapsed?: number;
  days_in_month?: number;
  daily_spending_rate?: number;
  projected_monthly_expenses?: number;
  projected_month_end_balance?: number;
  projected_budget_usage?: number;
  projected_budget_remaining?: number;
  budget_forecast?: string;
  cash_flow_forecast?: string;
}

interface SpendingCategory {
  category?: string;
  amount?: number;
  percentage?: number;
}

interface SpendingAnalysis {
  total_spending?: number;
  expense_transaction_count?: number;
  category_count?: number;
  highest_spending_category?: string | null;
  highest_spending_amount?: number;
  highest_spending_percentage?: number;
  spending_pattern?: string;
  categories?: SpendingCategory[];
}

interface FinancialProfile {
  overall_status?: string;
  cash_flow_behavior?: string;
  spending_behavior?: string;
  budget_discipline?: string;
  goal_discipline?: string;
  spending_pattern?: string;
  financial_health_rating?: string;
  summary?: string;
}

interface FinancialBehavior {
  behavior_score?: number;
  personality?: string;
  traits?: string[];
  spending_ratio?: number | null;
  message?: string;
}

interface AITwinData {
  user_id: number;

  financials?: Financials;

  monthly_financials?: MonthlyFinancials;

  budgets?: Budgets;

  goals?: Goals;

  health_score?: HealthScore;

  insights?: Insight[];

  recommendations?: Recommendation[];

  risks?: Risk[];

  forecast?: Forecast;

  spending_analysis?: SpendingAnalysis;

  financial_profile?: FinancialProfile;

  financial_behavior?: FinancialBehavior;

  [key: string]: unknown;
}


// =========================================================
// HELPERS
// =========================================================

const formatCurrency = (amount?: number) => {
  const safeAmount = Number(amount || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safeAmount);
};


const clamp = (value?: number) => {
  return Math.max(
    0,
    Math.min(100, Number(value || 0))
  );
};


const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token")
  );
};


const getMonthName = (month?: number) => {
  if (!month) return "";

  return new Date(
    2000,
    month - 1,
    1
  ).toLocaleString("en-IN", {
    month: "long",
  });
};


// =========================================================
// COMPONENT
// =========================================================

export default function AITwinPage() {

  const [data, setData] =
    useState<AITwinData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);


  // =======================================================
  // LOAD AI TWIN
  // =======================================================

  const loadAITwin = useCallback(
    async (manualRefresh = false) => {

      try {

        if (manualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const token = getToken();

        if (!token) {

          setError(
            "Authentication token not found. Please login again."
          );

          return;
        }


        const response = await fetch(
          `${API_URL}/ai-twin/overview`,
          {
            method: "GET",

            headers: {
              Accept: "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            cache: "no-store",
          }
        );


        if (response.status === 401) {

          setError(
            "Your login session has expired. Please login again."
          );

          return;
        }


        if (!response.ok) {

          const errorData =
            await response
              .json()
              .catch(() => null);

          throw new Error(
            errorData?.detail ||
            "Failed to load AI Twin."
          );
        }


        const result: AITwinData =
          await response.json();

        setData(result);

      } catch (err) {

        console.error(
          "AI Twin Error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load AI Twin."
        );

      } finally {

        setLoading(false);
        setRefreshing(false);
      }

    },
    []
  );



  useEffect(() => {
    loadAITwin();
  }, [loadAITwin]);


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (

      <div className="flex min-h-screen bg-[#020817] text-white">

        <Sidebar />

        <div className="h-screen min-w-0 flex-1 overflow-y-auto p-6 md:p-8">

          <div className="flex min-h-[70vh] items-center justify-center">

            <div className="text-center">

              <RefreshCw
                size={32}
                className="mx-auto mb-4 animate-spin text-emerald-400"
              />

              <p className="text-slate-400">
                Building your financial digital twin...
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }


  // =======================================================
  // ERROR
  // =======================================================

  if (error) {

    return (

      <div className="flex h-screen overflow-hidden bg-[#020817] text-white">

        <Sidebar />

        <div className="flex h-screen overflow-hidden bg-[#020817] text-white">

          <div className="mx-auto mt-20 max-w-xl rounded-xl border border-red-500/30 bg-red-500/10 p-6">

            <AlertTriangle
              className="mb-3 text-red-400"
              size={30}
            />

            <h2 className="text-xl font-bold">
              Unable to Load AI Twin
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              {error}
            </p>

            <button
              onClick={() => loadAITwin(true)}
              className="mt-5 rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }


  if (!data) {
    return null;
  }


  // =======================================================
  // DATA
  // =======================================================

  const financials = data.financials;

  const monthly =
    data.monthly_financials;

  const budgets = data.budgets;

  const goals = data.goals;

  const health = data.health_score;

  const profile =
    data.financial_profile;

  const behavior =
    data.financial_behavior;

  const spending =
    data.spending_analysis;

  const forecast =
    data.forecast;

  const insights =
    data.insights || [];

  const recommendations =
    data.recommendations || [];

  const risks =
    data.risks || [];


  // =======================================================
  // PAGE
  // =======================================================

  return (

    <div className="flex h-screen overflow-hidden bg-[#020817] text-white">

      <Sidebar />

      <main className="h-screen min-w-0 flex-1 overflow-y-auto p-5 md:p-7 lg:p-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <Brain
                className="text-emerald-400"
                size={30}
              />

              <h1 className="text-3xl font-bold">
                AI Twin
              </h1>

            </div>

            <p className="mt-2 text-sm text-slate-400">
              Your intelligent financial digital twin.
            </p>

          </div>


          <button
            onClick={() => loadAITwin(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
          >

            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Analysis"}

          </button>

        </div>


        {/* =================================================
            TOP SUMMARY
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Financial Health"
            value={`${health?.score || 0}/100`}
            subtitle={health?.rating || "N/A"}
            icon={<Activity size={20} />}
          />

          <StatCard
            title="Current Balance"
            value={formatCurrency(
              financials?.balance
            )}
            subtitle="Income − Expenses"
            icon={<Wallet size={20} />}
          />

          <StatCard
            title="Budget Used"
            value={`${Number(
              budgets?.used_percentage || 0
            ).toFixed(1)}%`}
            subtitle={
              budgets?.status ||
              "No Budget"
            }
            icon={
              <CircleDollarSign size={20} />
            }
          />

          <StatCard
            title="Goal Progress"
            value={`${Number(
              goals?.progress || 0
            ).toFixed(1)}%`}
            subtitle={`${goals?.active_goals || 0} active goal(s)`}
            icon={<Target size={20} />}
          />

        </div>


        {/* =================================================
            FINANCIAL PROFILE
        ================================================= */}

        <SectionCard className="mt-6">

          <div className="flex items-start gap-4">

            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">

              <Sparkles size={25} />

            </div>


            <div className="flex-1">

              <p className="text-sm font-medium text-emerald-400">
                FINANCIAL PROFILE
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {profile?.overall_status ||
                  health?.rating ||
                  "Financial Analysis"}
              </h2>

              <p className="mt-3 leading-7 text-slate-300">
                {profile?.summary ||
                  "Your AI Twin is analyzing your financial activity."}
              </p>


              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                <MiniInfo
                  label="Cash Flow"
                  value={
                    profile?.cash_flow_behavior ||
                    "N/A"
                  }
                />

                <MiniInfo
                  label="Spending"
                  value={
                    profile?.spending_behavior ||
                    "N/A"
                  }
                />

                <MiniInfo
                  label="Budget Discipline"
                  value={
                    profile?.budget_discipline ||
                    "N/A"
                  }
                />

                <MiniInfo
                  label="Goal Discipline"
                  value={
                    profile?.goal_discipline ||
                    "N/A"
                  }
                />

                <MiniInfo
                  label="Spending Pattern"
                  value={
                    profile?.spending_pattern ||
                    "N/A"
                  }
                />

                <MiniInfo
                  label="Health Rating"
                  value={
                    profile?.financial_health_rating ||
                    health?.rating ||
                    "N/A"
                  }
                />

              </div>

            </div>

          </div>

        </SectionCard>


        {/* =================================================
            FINANCIAL BEHAVIOR
        ================================================= */}

        <div className="mt-6 grid gap-6 xl:grid-cols-2">

          <SectionCard>

            <SectionTitle
              icon={<Brain size={20} />}
              title="Financial Behavior"
              subtitle="AI analysis of your financial habits"
            />


            <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950/30 p-5">

              <p className="text-sm text-slate-400">
                Financial Personality
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-400">
                {behavior?.personality ||
                  "Not Available"}
              </p>


              <div className="mt-5">

                <div className="mb-2 flex justify-between text-sm">

                  <span className="text-slate-400">
                    Behavior Score
                  </span>

                  <span className="font-semibold">
                    {behavior?.behavior_score || 0}/100
                  </span>

                </div>

                <ProgressBar
                  value={
                    behavior?.behavior_score
                  }
                />

              </div>


              {behavior?.traits &&
                behavior.traits.length > 0 && (

                  <div className="mt-5 flex flex-wrap gap-2">

                    {behavior.traits.map(
                      (trait, index) => (

                        <span
                          key={index}
                          className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300"
                        >
                          {trait}
                        </span>

                      )
                    )}

                  </div>

                )}


              {behavior?.message && (

                <p className="mt-5 text-sm leading-6 text-slate-300">
                  {behavior.message}
                </p>

              )}

            </div>

          </SectionCard>


          {/* ===============================================
              MONTHLY CASH FLOW
          =============================================== */}

          <SectionCard>

            <SectionTitle
              icon={<TrendingUp size={20} />}
              title="Monthly Cash Flow"
              subtitle={
                monthly
                  ? `${getMonthName(
                      monthly.month
                    )} ${monthly.year}`
                  : "Current month"
              }
            />


            <div className="mt-5 grid grid-cols-2 gap-4">

              <MoneyBox
                label="Income"
                amount={
                  monthly?.income || 0
                }
                positive
              />

              <MoneyBox
                label="Expenses"
                amount={
                  monthly?.expenses || 0
                }
              />

              <MoneyBox
                label="Balance"
                amount={
                  monthly?.balance || 0
                }
                positive={
                  Number(
                    monthly?.balance || 0
                  ) >= 0
                }
              />

              <MoneyBox
                label="Savings Rate"
                amount={
                  financials?.savings_rate ||
                  0
                }
                percentage
                positive={
                  Number(
                    financials?.savings_rate ||
                    0
                  ) >= 0
                }
              />

            </div>

          </SectionCard>

        </div>


        {/* =================================================
            BUDGET + GOALS
        ================================================= */}

        <div className="mt-6 grid gap-6 xl:grid-cols-2">

          {/* BUDGET */}

          <SectionCard>

            <SectionTitle
              icon={
                <CircleDollarSign size={20} />
              }
              title="Budget Health"
              subtitle="Current monthly budget performance"
            />


            <div className="mt-6">

              <div className="flex items-end justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    Budget Used
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {Number(
                      budgets?.used_percentage ||
                      0
                    ).toFixed(1)}
                    %
                  </p>

                </div>


                <StatusBadge
                  text={
                    budgets?.status ||
                    "No Budget"
                  }
                />

              </div>


              <div className="mt-4">

                <ProgressBar
                  value={
                    budgets?.used_percentage
                  }
                />

              </div>


              <div className="mt-6 grid grid-cols-3 gap-3">

                <MiniInfo
                  label="Budget"
                  value={formatCurrency(
                    budgets?.total_budget
                  )}
                />

                <MiniInfo
                  label="Spent"
                  value={formatCurrency(
                    budgets?.spent
                  )}
                />

                <MiniInfo
                  label="Remaining"
                  value={formatCurrency(
                    budgets?.remaining
                  )}
                />

              </div>

            </div>

          </SectionCard>


          {/* GOALS */}

          <SectionCard>

            <SectionTitle
              icon={<Goal size={20} />}
              title="Goal Progress"
              subtitle="Progress toward your savings targets"
            />


            <div className="mt-6">

              <div className="flex items-end justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    Overall Progress
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {Number(
                      goals?.progress || 0
                    ).toFixed(1)}
                    %
                  </p>

                </div>


                <p className="text-sm text-emerald-400">
                  {goals?.completed_goals ||
                    0}{" "}
                  completed
                </p>

              </div>


              <div className="mt-4">

                <ProgressBar
                  value={goals?.progress}
                />

              </div>


              <div className="mt-6 grid grid-cols-3 gap-3">

                <MiniInfo
                  label="Target"
                  value={formatCurrency(
                    goals?.total_target
                  )}
                />

                <MiniInfo
                  label="Saved"
                  value={formatCurrency(
                    goals?.total_saved
                  )}
                />

                <MiniInfo
                  label="Remaining"
                  value={formatCurrency(
                    goals?.remaining
                  )}
                />

              </div>

            </div>

          </SectionCard>

        </div>


        {/* =================================================
            SPENDING ANALYSIS
        ================================================= */}

        <SectionCard className="mt-6">

          <SectionTitle
            icon={<Wallet size={20} />}
            title="Spending Analysis"
            subtitle="How your money is being distributed"
          />


          <div className="mt-6 grid gap-6 lg:grid-cols-3">

            <div>

              <MiniInfo
                label="Total Spending"
                value={formatCurrency(
                  spending?.total_spending
                )}
              />

              <div className="mt-3">

                <MiniInfo
                  label="Top Category"
                  value={
                    spending?.highest_spending_category ||
                    "N/A"
                  }
                />

              </div>

              <div className="mt-3">

                <MiniInfo
                  label="Spending Pattern"
                  value={
                    spending?.spending_pattern ||
                    "N/A"
                  }
                />

              </div>

            </div>


            <div className="lg:col-span-2">

              {spending?.categories &&
              spending.categories.length > 0 ? (

                <div className="space-y-4">

                  {spending.categories.map(
                    (category, index) => (

                      <div key={index}>

                        <div className="mb-2 flex justify-between text-sm">

                          <span className="text-slate-300">
                            {category.category}
                          </span>

                          <span className="text-slate-400">
                            {formatCurrency(
                              category.amount
                            )}{" "}
                            ·{" "}
                            {Number(
                              category.percentage ||
                              0
                            ).toFixed(1)}
                            %
                          </span>

                        </div>

                        <ProgressBar
                          value={
                            category.percentage
                          }
                        />

                      </div>

                    )
                  )}

                </div>

              ) : (

                <EmptyMessage text="No spending category data available." />

              )}

            </div>

          </div>

        </SectionCard>


        {/* =================================================
            FORECAST
        ================================================= */}

        <SectionCard className="mt-6">

          <SectionTitle
            icon={<TrendingUp size={20} />}
            title="Financial Forecast"
            subtitle="Projection based on your current financial behavior"
          />


          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <ForecastBox
              label="Daily Spending"
              value={formatCurrency(
                forecast?.daily_spending_rate
              )}
            />

            <ForecastBox
              label="Projected Expenses"
              value={formatCurrency(
                forecast?.projected_monthly_expenses
              )}
            />

            <ForecastBox
              label="Projected Balance"
              value={formatCurrency(
                forecast?.projected_month_end_balance
              )}
            />

            <ForecastBox
              label="Projected Budget Use"
              value={`${Number(
                forecast?.projected_budget_usage ||
                0
              ).toFixed(1)}%`}
            />

          </div>


          <div className="mt-5 grid gap-4 md:grid-cols-2">

            <MiniInfo
              label="Budget Forecast"
              value={
                forecast?.budget_forecast ||
                "Not Available"
              }
            />

            <MiniInfo
              label="Cash Flow Forecast"
              value={
                forecast?.cash_flow_forecast ||
                "Not Available"
              }
            />

          </div>

        </SectionCard>


        {/* =================================================
            INSIGHTS
        ================================================= */}

        <SectionCard className="mt-6">

          <SectionTitle
            icon={<Lightbulb size={20} />}
            title="AI Insights"
            subtitle="Important observations from your financial twin"
          />


          <div className="mt-5 grid gap-4 lg:grid-cols-2">

            {insights.length > 0 ? (

              insights.map(
                (insight, index) => (

                  <InsightCard
                    key={index}
                    title={
                      insight.title ||
                      "Financial Insight"
                    }
                    message={
                      insight.message || ""
                    }
                    label={
                      insight.category ||
                      insight.type
                    }
                  />

                )
              )

            ) : (

              <EmptyMessage text="No insights available yet." />

            )}

          </div>

        </SectionCard>


        {/* =================================================
            RISKS
        ================================================= */}

        <SectionCard className="mt-6">

          <SectionTitle
            icon={<ShieldAlert size={20} />}
            title="Risk Detection"
            subtitle="Potential financial risks requiring attention"
          />


          <div className="mt-5 grid gap-4 lg:grid-cols-2">

            {risks.length > 0 ? (

              risks.map(
                (risk, index) => (

                  <div
                    key={index}
                    className="rounded-xl border border-red-500/20 bg-red-500/5 p-5"
                  >

                    <div className="flex items-start gap-3">

                      <AlertTriangle
                        size={20}
                        className="mt-0.5 shrink-0 text-red-400"
                      />

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold">
                            {risk.title ||
                              "Financial Risk"}
                          </h3>

                          <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium uppercase text-red-400">
                            {risk.level ||
                              "Risk"}
                          </span>

                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {risk.message}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )

            ) : (

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">

                <div className="flex items-center gap-3">

                  <CheckCircle2 className="text-emerald-400" />

                  <div>

                    <p className="font-semibold">
                      No Major Risks Detected
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Your AI Twin has not identified any major financial risks.
                    </p>

                  </div>

                </div>

              </div>

            )}

          </div>

        </SectionCard>


        {/* =================================================
            RECOMMENDATIONS
        ================================================= */}

        <SectionCard className="mt-6">

          <SectionTitle
            icon={<Sparkles size={20} />}
            title="Personalized Recommendations"
            subtitle="Actions suggested by your AI Twin"
          />


          <div className="mt-5 grid gap-4 lg:grid-cols-2">

            {recommendations.length > 0 ? (

              recommendations.map(
                (recommendation, index) => (

                  <div
                    key={index}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5"
                  >

                    <div className="flex items-start gap-3">

                      <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">

                        <Sparkles size={18} />

                      </div>


                      <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
                          {recommendation.category ||
                            "Recommendation"}
                        </p>

                        <h3 className="mt-1 font-semibold">
                          {recommendation.title ||
                            "Financial Recommendation"}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {recommendation.action}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )

            ) : (

              <EmptyMessage text="No recommendations available yet." />

            )}

          </div>

        </SectionCard>

      </main>

    </div>
  );
}


// =========================================================
// REUSABLE COMPONENTS
// =========================================================

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {

  return (

    <section
      className={`rounded-xl border border-slate-800 bg-[#0f172a] p-5 md:p-6 ${className}`}
    >
      {children}
    </section>

  );
}


function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {

  return (

    <div className="flex items-start gap-3">

      <div className="mt-0.5 text-emerald-400">
        {icon}
      </div>

      <div>

        <h2 className="text-lg font-bold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          {subtitle}
        </p>

      </div>

    </div>

  );
}


function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {

  return (

    <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>

        </div>


        <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400">
          {icon}
        </div>

      </div>

    </div>

  );
}


function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div className="rounded-lg border border-slate-800 bg-slate-950/30 p-3">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-200">
        {value}
      </p>

    </div>

  );
}


function ProgressBar({
  value,
}: {
  value?: number;
}) {

  const percentage = clamp(value);

  return (

    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">

      <div
        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
        style={{
          width: `${percentage}%`,
        }}
      />

    </div>

  );
}


function MoneyBox({
  label,
  amount,
  positive = false,
  percentage = false,
}: {
  label: string;
  amount: number;
  positive?: boolean;
  percentage?: boolean;
}) {

  return (

    <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-bold ${
          positive
            ? "text-emerald-400"
            : amount < 0
            ? "text-red-400"
            : "text-white"
        }`}
      >

        {percentage
          ? `${Number(amount).toFixed(1)}%`
          : formatCurrency(amount)}

      </p>

    </div>

  );
}


function ForecastBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold">
        {value}
      </p>

    </div>

  );
}


function InsightCard({
  title,
  message,
  label,
}: {
  title: string;
  message: string;
  label?: string;
}) {

  return (

    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">

      <div className="flex items-start gap-3">

        <Lightbulb
          size={19}
          className="mt-0.5 shrink-0 text-amber-400"
        />

        <div>

          {label && (

            <p className="text-xs font-medium uppercase text-amber-400">
              {label}
            </p>

          )}

          <h3 className="mt-1 font-semibold">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {message}
          </p>

        </div>

      </div>

    </div>

  );
}


function StatusBadge({
  text,
}: {
  text: string;
}) {

  const normalized =
    text.toLowerCase();

  let style =
    "bg-slate-500/10 text-slate-300 border-slate-500/20";


  if (
    normalized.includes("healthy") ||
    normalized.includes("good") ||
    normalized.includes("excellent")
  ) {

    style =
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  } else if (
    normalized.includes("warning") ||
    normalized.includes("attention")
  ) {

    style =
      "bg-amber-500/10 text-amber-400 border-amber-500/20";

  } else if (
    normalized.includes("over") ||
    normalized.includes("poor") ||
    normalized.includes("critical")
  ) {

    style =
      "bg-red-500/10 text-red-400 border-red-500/20";
  }


  return (

    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${style}`}
    >
      {text}
    </span>

  );
}


function EmptyMessage({
  text,
}: {
  text: string;
}) {

  return (

    <div className="rounded-xl border border-dashed border-slate-700 p-5 text-sm text-slate-500">
      {text}
    </div>

  );
}