// Skeleton de base
const Skeleton = ({ 
  width = "w-full", 
  height = "h-4", 
  rounded = "rounded",
  className = "",
  animated = true
}) => {
  return (
    <div 
      className={`bg-gray-200 ${width} ${height} ${rounded} ${className} ${
        animated ? "animate-pulse" : ""
      }`}
    ></div>
  );
};

// Skeleton pour texte
export const SkeletonText = ({ lines = 3, spacing = "space-y-2" }) => {
  return (
    <div className={spacing}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          width={index === lines - 1 ? "w-3/4" : "w-full"}
        />
      ))}
    </div>
  );
};

// Skeleton pour carte produit
export const SkeletonProductCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      {/* Image */}
      <Skeleton height="aspect-square" rounded="rounded-lg" className="mb-4" />
      
      {/* Brand */}
      <Skeleton width="w-1/3" height="h-3" className="mb-2" />
      
      {/* Title */}
      <Skeleton width="w-full" height="h-4" className="mb-2" />
      <Skeleton width="w-2/3" height="h-4" className="mb-4" />
      
      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton width="w-20" height="h-3" />
        <Skeleton width="w-8" height="h-3" />
      </div>
      
      {/* Price */}
      <Skeleton width="w-1/2" height="h-6" />
    </div>
  );
};

// Skeleton pour carte article de blog
export const SkeletonArticleCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image */}
      <Skeleton height="h-48" rounded="rounded-none" />
      
      <div className="p-5">
        {/* Badge */}
        <Skeleton width="w-20" height="h-6" rounded="rounded-full" className="mb-3" />
        
        {/* Title */}
        <Skeleton width="w-full" height="h-5" className="mb-2" />
        <Skeleton width="w-3/4" height="h-5" className="mb-4" />
        
        {/* Excerpt */}
        <SkeletonText lines={2} />
        
        {/* Meta */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
          <div className="flex-1">
            <Skeleton width="w-24" height="h-3" className="mb-1" />
            <Skeleton width="w-16" height="h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton pour tableau
export const SkeletonTable = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="py-3 px-4">
                <Skeleton width="w-24" height="h-4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="py-3 px-4">
                  <Skeleton width="w-full" height="h-4" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Skeleton pour page complète
export const SkeletonPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton width="w-1/3" height="h-8" className="mb-2" />
        <Skeleton width="w-1/2" height="h-4" />
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <Skeleton width="w-12" height="h-12" rounded="rounded-full" className="mb-4" />
            <Skeleton width="w-24" height="h-4" className="mb-2" />
            <Skeleton width="w-16" height="h-8" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonTable rows={8} columns={6} />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="flex gap-3">
                <Skeleton width="w-10" height="h-10" rounded="rounded-full" />
                <div className="flex-1">
                  <Skeleton width="w-3/4" height="h-4" className="mb-2" />
                  <Skeleton width="w-1/2" height="h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton pour formulaire
export const SkeletonForm = ({ fields = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <Skeleton width="w-32" height="h-4" className="mb-2" />
          <Skeleton width="w-full" height="h-10" rounded="rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton width="w-32" height="h-10" rounded="rounded-lg" />
        <Skeleton width="w-24" height="h-10" rounded="rounded-lg" />
      </div>
    </div>
  );
};

export default Skeleton;