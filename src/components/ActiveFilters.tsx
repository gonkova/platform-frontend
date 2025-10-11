"use client";

interface ActiveFiltersProps {
  categories: any[];
  roles: any[];
  difficulties: string[];
  searchQuery: string;
  onRemoveCategory: (id: number) => void;
  onRemoveRole: (id: number) => void;
  onRemoveDifficulty: (difficulty: string) => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}

export default function ActiveFilters({
  categories,
  roles,
  difficulties,
  searchQuery,
  onRemoveCategory,
  onRemoveRole,
  onRemoveDifficulty,
  onClearSearch,
  onClearAll,
}: ActiveFiltersProps) {
  const hasFilters =
    categories.length > 0 ||
    roles.length > 0 ||
    difficulties.length > 0 ||
    searchQuery;

  if (!hasFilters) return null;

  const difficultyLabels: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Активни филтри</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Изчисти всички
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Search Query */}
        {searchQuery && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
            Търсене: "{searchQuery}"
            <button
              onClick={onClearSearch}
              className="ml-2 hover:text-purple-900"
            >
              ×
            </button>
          </span>
        )}

        {/* Categories */}
        {categories.map((category) => (
          <span
            key={category.id}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
          >
            {category.name}
            <button
              onClick={() => onRemoveCategory(category.id)}
              className="ml-2 hover:text-blue-900"
            >
              ×
            </button>
          </span>
        ))}

        {/* Roles */}
        {roles.map((role) => (
          <span
            key={role.id}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
          >
            {role.display_name}
            <button
              onClick={() => onRemoveRole(role.id)}
              className="ml-2 hover:text-green-900"
            >
              ×
            </button>
          </span>
        ))}

        {/* Difficulties */}
        {difficulties.map((difficulty) => (
          <span
            key={difficulty}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800"
          >
            {difficultyLabels[difficulty]}
            <button
              onClick={() => onRemoveDifficulty(difficulty)}
              className="ml-2 hover:text-yellow-900"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
