import React from 'react';
import { 
  BarChart3, 
  Users, 
  Crown, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  MapPin
} from 'lucide-react';
import { GroupStats } from '../../types';

interface GroupAnalyticsProps {
  stats: GroupStats;
}

/**
 * Group Analytics Component
 * 
 * Provides comprehensive analytics and reporting for group management:
 * - Group statistics and metrics
 * - Member distribution analysis
 * - Leader effectiveness tracking
 * - Workplace assignment analytics
 * - Activity trends and insights
 */
const GroupAnalytics: React.FC<GroupAnalyticsProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Group Analytics</h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive insights into your organization's group structure and performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Groups</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalGroups}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+2 this month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Members</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalMembers}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+15 this month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Crown className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Leaders</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalLeaders}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+3 this month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Group Size</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.averageGroupSize}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600">-2 this month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Groups by Depth */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Groups by Depth</h3>
            <p className="mt-1 text-sm text-gray-500">
              Distribution of groups across hierarchical levels
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.groupsByDepth.map((item) => (
                <div key={item.depth} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{item.depth}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.depth === 0 ? 'Top Level' : `Level ${item.depth}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(item.count / stats.totalGroups) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Members by Group */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Members by Group</h3>
            <p className="mt-1 text-sm text-gray-500">
              Member distribution across groups
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.membersByGroup.map((group) => (
                <div key={group.groupId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{group.groupName}</span>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{group.memberCount} members</span>
                        <span>•</span>
                        <span>{group.leaderCount} leaders</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(group.memberCount / stats.totalMembers) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {group.memberCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <p className="mt-1 text-sm text-gray-500">
            Latest group management activities and changes
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.groupName}</span>
                    <span className="ml-1 text-gray-500">{activity.activity}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Key Insights</h3>
            <p className="mt-1 text-sm text-gray-500">
              Automated analysis of your group structure
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Healthy Growth</h4>
                <p className="text-sm text-gray-500">
                  Your organization has added 2 new groups this month, showing healthy expansion.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Users className="h-5 w-5 text-blue-500 mt-0.5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Balanced Distribution</h4>
                <p className="text-sm text-gray-500">
                  Member distribution across groups is well-balanced with an average of {stats.averageGroupSize} members per group.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Crown className="h-5 w-5 text-yellow-500 mt-0.5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Leadership Coverage</h4>
                <p className="text-sm text-gray-500">
                  {stats.totalLeaders} leaders are managing {stats.totalMembers} members, providing good leadership coverage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
            <p className="mt-1 text-sm text-gray-500">
              Suggestions to optimize your group structure
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <MapPin className="h-5 w-5 text-purple-500 mt-0.5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Consider Subgroups</h4>
                <p className="text-sm text-gray-500">
                  Your top-level group has {stats.membersByGroup[0]?.memberCount} members. Consider creating subgroups for better management.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Crown className="h-5 w-5 text-yellow-500 mt-0.5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Leader Development</h4>
                <p className="text-sm text-gray-500">
                  Consider promoting more members to leadership roles to improve management coverage.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Activity className="h-5 w-5 text-green-500 mt-0.5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Regular Reviews</h4>
                <p className="text-sm text-gray-500">
                  Schedule monthly reviews of group structure to ensure optimal organization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupAnalytics; 