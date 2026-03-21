import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Crown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createOrder, verifyPayment, cancelPlan } from '../services/payment.service';
import { useAuth } from '../context/AuthContext';

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
        <div className="min-h-screen bg-black text-white py-20 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-[150px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 font-sans">

                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                        Supercharge Your Interview Prep
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Top up your credits to unlock AI-driven mock interviews, deep insights, and land your dream job faster. These credits will stay active for a month.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative group rounded-3xl backdrop-blur-xl border bg-white/5 p-8 transition-all duration-300 hover:-translate-y-2
                ${plan.borderColor} ${plan.popular ? 'md:-mt-8 md:mb-8 scale-105 shadow-2xl shadow-purple-500/20' : ''}`}
                        >

                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            {/* Background gradient on hover */}
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>

                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                                    <div className="mt-2 flex items-baseline">
                                        <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                        <span className="text-gray-400 ml-1">{plan.period}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    {plan.icon}
                                </div>
                            </div>

                            <div className="mb-8 p-4 bg-black/40 rounded-xl border border-white/5">
                                <p className="text-sm text-gray-300 font-medium text-center">
                                    <span className="text-white font-bold">{plan.credits}</span> Credits Included
                                </p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start text-gray-300">
                                        <Check className="w-5 h-5 text-green-400 mr-3 shrink-0" />
                                        <span className="text-sm leading-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="w-full">
                                {user?.plan === plan.id ? (
                                    <div className="space-y-3 w-full animate-fade-in">
                                        <button disabled className="w-full py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center bg-green-500/20 text-green-400 border border-green-500/30">
                                            <Check className="w-5 h-5 mr-2" /> Active Plan
                                        </button>
                                        <button
                                            onClick={handleCancelPlan}
                                            disabled={cancelling}
                                            className="w-full py-2.5 rounded-xl font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all text-sm flex items-center justify-center"
                                        >
                                            {cancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Cancel Subscription'}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleUpgrade(plan.id, plan.credits)}
                                        disabled={loadingPlan === plan.id || Boolean(user?.plan && user.plan !== 'free')}
                                        className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-lg flex items-center justify-center
                                            ${plan.buttonBg} disabled:opacity-50 disabled:cursor-not-allowed
                                            ${plan.popular ? 'shadow-purple-500/30 hover:shadow-purple-500/50' : ''}`}
                                    >
                                        {loadingPlan === plan.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            plan.buttonText
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ or Trust Badge Section (Optional) */}
                <div className="mt-20 text-center">
                    <p className="text-sm text-gray-500">Secure payments powered by <span className="text-gray-300 font-semibold">Razorpay</span></p>
                </div>

            </div>
        </div>
    );
};

export default Pricing;
