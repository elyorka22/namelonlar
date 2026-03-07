import { FileText, Users, Clock, CheckCircle, FolderTree, Star } from "lucide-react";

interface AdminStatsProps {
  totalListings: number;
  totalUsers: number;
  pendingModeration: number;
  activeListings: number;
  totalCategories: number;
  vipListings: number;
}

export function AdminStats({
  totalListings,
  totalUsers,
  pendingModeration,
  activeListings,
  totalCategories,
  vipListings,
}: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Jami e'lonlar</p>
            <p className="text-3xl font-bold text-gray-900">{totalListings}</p>
          </div>
          <FileText className="text-primary-600" size={32} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Foydalanuvchilar</p>
            <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
          </div>
          <Users className="text-blue-600" size={32} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Moderatsiyada</p>
            <p className="text-3xl font-bold text-yellow-600">
              {pendingModeration}
            </p>
          </div>
          <Clock className="text-yellow-600" size={32} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Faol e'lonlar</p>
            <p className="text-3xl font-bold text-green-600">
              {activeListings}
            </p>
          </div>
          <CheckCircle className="text-green-600" size={32} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Kategoriyalar</p>
            <p className="text-3xl font-bold text-purple-600">
              {totalCategories}
            </p>
          </div>
          <FolderTree className="text-purple-600" size={32} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">VIP e'lonlar</p>
            <p className="text-3xl font-bold text-orange-600">
              {vipListings}
            </p>
          </div>
          <Star className="text-orange-600" size={32} />
        </div>
      </div>
    </div>
  );
}

