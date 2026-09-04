const cron = require("node-cron");
const User = require("../models/User");

// Run everyday at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running credit refresh check...");

    try {
        const currentDate = new Date();

        // Find users whose plan has expired, and who are not already on the "free" plan
        const expiredUsers = await User.find({
            planExpiresAt: { $lte: currentDate },
            plan: { $ne: "free" }
        });

        if (expiredUsers.length > 0) {
            console.log(`[CRON] Found ${expiredUsers.length} users with expired plans. Downgrading to free...`);

            for (const user of expiredUsers) {
                if (user.plan === "ultimate") {
                    // Reset synthetic unlimited credits to free tier baseline
                    user.credits = 500;
                } else {
                    // Preserve legitimately purchased, unspent credits
                    user.credits = Math.max(user.credits || 0, 0);
                }
                user.plan = "free";
                user.planExpiresAt = null;
                await user.save();
            }

            console.log("[CRON] Successfully downgraded expired plans.");
        } else {
            console.log("[CRON] No users with expired plans found today.");
        }

    } catch (err) {
        console.error("[CRON] Error running credit refresh check:", err);
    }
});
