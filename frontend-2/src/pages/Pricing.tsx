import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Crown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createOrder, verifyPayment, cancelPlan } from '../services/payment.service';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Use window.Razorpay properly
declare global {
    interface Window {
        Razorpay: any;
    }
}

const Pricing = () => {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const navigate = useNavigate();
    const { user, setUserContext } = useAuth();

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async (planId: string, _creditsText: string) => {
        if (!user) {
            toast.error('Please login to upgrade your plan');
            navigate('/login');
            return;
        }

        setLoadingPlan(planId);

        try {
            const res = await loadRazorpayScript();
            if (!res) {
                toast.error('Razorpay SDK failed to load. Are you offline?');
                setLoadingPlan(null);
                return;
            }

            // 1. Create Order on Backend
            const order = await createOrder(planId);

            // 2. Initialize Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Interview AI',
                description: `Upgrade to ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
                order_id: order.orderId,
                handler: async function (response: any) {
                    try {
                        // 3. Verify Payment on Backend
                        const verifyRes = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: planId
                        });

                        toast.success(`Successfully upgraded to ${planId} plan! You now have ${verifyRes.credits} credits.`);

                        // Optionally update user context here if available
                        if (setUserContext && user) {
                            setUserContext({ ...user, plan: verifyRes.plan, credits: verifyRes.credits });
                        } else {
                            window.location.reload(); // Quick refresh to sync state if setUser is not exposed
                        }

                    } catch (err: any) {
                        toast.error(err.message || 'Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                },
                theme: {
                    color: '#8b5cf6', // Violet color matching the theme
                },
            };

            const paymentObject = new window.Razorpay(options);

            paymentObject.on('payment.failed', function (response: any) {
                toast.error(`Payment Failed: ${response.error.description}`);
            });

            paymentObject.open();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error initiating payment');
        } finally {
            setLoadingPlan(null);
        }
    };

    const handleCancelPlan = async () => {
        if (!window.confirm('Are you sure you want to cancel your active plan? You will retain your currently existing credits, but you will instantly lose premium plan benefits.')) return;

        setCancelling(true);
        try {
            const res = await cancelPlan();
            toast.success(res.message);
            if (setUserContext && user) {
                setUserContext({ ...user, plan: res.plan, credits: res.credits });
            } else {
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.message || 'Failed to cancel plan.');
        } finally {
            setCancelling(false);
        }
    };

    const plans = [
        {
            id: 'standard',
            name: 'Standard',
            price: '₹200',
            period: '',
            credits: '1000',
            icon: <Star className="w-6 h-6 text-blue-400" />,
            features: [
                '1000 AI Credits',
                'Credits valid for 1 Month',
                '~100 Interview Questions',
                'Basic AI Summaries',
                'Standard Support'
            ],
            buttonText: 'Get Standard',
            popular: false,
            color: 'from-blue-500/20 to-cyan-500/20',
            borderColor: 'border-blue-500/30 hover:border-blue-500/50',
            buttonBg: 'bg-blue-600 hover:bg-blue-700'
        },
        {
            id: 'advance',
            name: 'Advance',
            price: '₹500',
            period: '',
            credits: '3000',
            icon: <Zap className="w-6 h-6 text-purple-400" />,
            features: [
                '3000 AI Credits',
                'Credits valid for 1 Month',
                '~300 Interview Questions',
                'Detailed AI Summaries & Feedback',
                'Priority Support',
                'Custom Interview Generation'
            ],
            buttonText: 'Get Advance',
            popular: true,
            color: 'from-purple-500/20 to-pink-500/20',
            borderColor: 'border-purple-500/50 hover:border-purple-400',
            buttonBg: 'bg-purple-600 hover:bg-purple-700'
        },
        {
            id: 'ultimate',
            name: 'Ultimate',
            price: '₹1000',
            period: '',
            credits: 'Unlimited',
            icon: <Crown className="w-6 h-6 text-yellow-400" />,
            features: [
                'Unlimited AI Credits',
                'Credits valid for 1 Month',
                'Unlimited Interview Questions',
                'Advanced AI Analytics & Insights',
                '24/7 Premium Support',
                'All Features Included'
            ],
            buttonText: 'Get Ultimate',
            popular: false,
            color: 'from-yellow-500/20 to-orange-500/20',
            borderColor: 'border-yellow-500/30 hover:border-yellow-500/50',
            buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
        }
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[#050505] text-white py-20 px-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[500px] w-full max-w-2xl mx-auto rounded-full bg-cyan-500/10 blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                        Supercharge Your Interview Prep
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Top up your credits to unlock AI-driven mock interviews, deep insights, and land your dream job faster. These credits will stay active for a month.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto px-4">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: (index + 1) * 0.1, type: "spring", stiffness: 100 }}
                            whileHover={{ scale: 1.02 }}
                            className={`relative flex flex-col group rounded-[2.5rem] backdrop-blur-3xl border bg-white/[0.02] p-8 transition-colors duration-300
                            border-t border-l border-white/10 border-b border-r border-white/5
                            ${plan.popular ? 'md:-mt-8 md:mb-8 border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.15)] hover:shadow-[0_0_60px_rgba(34,211,238,0.25)]' : 'hover:bg-white/[0.04]'}`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 text-black text-[10px] font-black uppercase tracking-[0.2em] px-5 py-1.5 rounded-full shadow-[0_0_15px_rgba(226,232,240,0.5)] z-20">
                                    MOST POPULAR
                                </div>
                            )}

                            {/* Hover Glow Behind Card */}
                            {plan.popular && (
                                <div className="absolute inset-0 rounded-[2.5rem] bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
                            )}

                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">{plan.name}</h3>
                                    <div className="mt-2 flex items-baseline">
                                        <span className="text-5xl font-black text-white font-mono">{plan.price}</span>
                                        <span className="text-slate-400 ml-2 font-medium">{plan.period}</span>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-2xl backdrop-blur-md border border-white/5 ${plan.popular ? 'bg-cyan-500/10 [&>svg]:text-cyan-400' : 'bg-white/5 [&>svg]:text-slate-300'}`}>
                                    {plan.icon}
                                </div>
                            </div>

                            <div className="mb-8 p-4 bg-black/60 rounded-2xl border border-white/5">
                                <p className="text-sm text-slate-300 font-medium text-center">
                                    <span className="text-white font-bold font-mono">{plan.credits}</span> Credits Included
                                </p>
                            </div>

                            <ul className="space-y-4 mb-12 flex-grow">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start text-slate-300 font-medium">
                                        <Check className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] mr-4 shrink-0" />
                                        <span className="text-sm leading-relaxed">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="w-full mt-auto">
                                {user?.plan === plan.id ? (
                                    <div className="space-y-3 w-full animate-fade-in">
                                        <button disabled className="w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                            <Check className="w-5 h-5 mr-2" /> Locked-In
                                        </button>
                                        <button
                                            onClick={handleCancelPlan}
                                            disabled={cancelling}
                                            className="w-full py-2.5 rounded-xl font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all text-xs flex items-center justify-center uppercase tracking-wider"
                                        >
                                            {cancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Cancel Plan'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative overflow-hidden rounded-2xl group/btn cursor-pointer">
                                        <button
                                            onClick={() => handleUpgrade(plan.id, plan.credits)}
                                            disabled={loadingPlan === plan.id || Boolean(user?.plan && user.plan !== 'free')}
                                            className={`w-full relative py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                ${plan.popular 
                                                    ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black hover:brightness-110 shadow-[0_0_15px_rgba(34,211,238,0.2)] border-none' 
                                                    : 'border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200'}`}
                                        >
                                            {loadingPlan === plan.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                plan.buttonText
                                            )}
                                        </button>
                                        {plan.popular && !Boolean(user?.plan && user.plan !== 'free') && (
                                            <motion.div 
                                                initial={{ x: "-100%" }}
                                                animate={{ x: "200%" }}
                                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                                                className="absolute inset-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none z-10"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Badge Section */}
                <div className="mt-24 text-center">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                        Secure payments powered by <span className="text-cyan-600/50">Razorpay</span>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Pricing;
