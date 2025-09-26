import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Article from '@/models/Article';
import Event from '@/models/Event';
import Payment from '@/models/Payment';
import ContactForm from '@/models/ContactForm';
import { requireAdmin } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        errorResponse('Admin access required'),
        { status: 403 }
      );
    }

    await connectDB();
    
    // Get basic counts
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      totalArticles,
      publishedArticles,
      totalEvents,
      upcomingEvents,
      totalPayments,
      completedPayments,
      unreadContacts
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Profile.countDocuments({ membershipStatus: 'pending' }),
      Article.countDocuments(),
      Article.countDocuments({ isPublished: true }),
      Event.countDocuments(),
      Event.countDocuments({ startDate: { $gte: new Date() } }),
      Payment.countDocuments(),
      Payment.countDocuments({ status: 'completed' }),
      ContactForm.countDocuments({ isRead: false })
    ]);

    // Get membership status breakdown
    const membershipStats = await Profile.aggregate([
      {
        $group: {
          _id: '$membershipStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly registration stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get revenue stats
    const revenueStats = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
        membershipBreakdown: membershipStats
      },
      content: {
        articles: {
          total: totalArticles,
          published: publishedArticles
        },
        events: {
          total: totalEvents,
          upcoming: upcomingEvents
        }
      },
      financial: {
        payments: {
          total: totalPayments,
          completed: completedPayments
        },
        revenue: revenueStats
      },
      communications: {
        unreadContacts
      },
      trends: {
        monthlyRegistrations
      }
    };

    return NextResponse.json(
      successResponse(stats, 'Statistics retrieved successfully')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}