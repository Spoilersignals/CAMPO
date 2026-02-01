import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ITEMS_PER_PAGE = 12;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const condition = searchParams.get("condition") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const sort = searchParams.get("sort") || "createdAt-desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const featured = searchParams.get("featured") || "";
    
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const where: Record<string, unknown> = {
      status: "ACTIVE",
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (category && category !== "All") {
      // Try to find by parent category first
      const parentCategories: Record<string, string[]> = {
        "Electronics": ["TV", "Speaker System", "Fan", "Microwave", "Refrigerator", "Cooker", "Water Heater", "Laptops", "Phones", "Other Electronics"],
        "Fashion": ["Men Wear", "Women Wear", "Shoes", "Bags"],
        "Furniture": [],
        "Books": [],
        "Food": [],
        "Services": [],
        "Events": [],
        "Other": [],
      };
      
      const subcategories = parentCategories[category];
      
      if (subcategories && subcategories.length > 0) {
        // Filter by any of the subcategories
        const categories = await prisma.category.findMany({
          where: { name: { in: subcategories } },
        });
        if (categories.length > 0) {
          where.categoryId = { in: categories.map(c => c.id) };
        }
      } else {
        // Try direct match
        const categoryRecord = await prisma.category.findFirst({
          where: { name: category },
        });
        if (categoryRecord) {
          where.categoryId = categoryRecord.id;
        }
      }
    }

    if (condition) {
      where.condition = condition;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        (where.price as Record<string, number>).gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        (where.price as Record<string, number>).lte = parseFloat(maxPrice);
      }
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort) {
      const [field, direction] = sort.split("-");
      orderBy = { [field]: direction };
    }

    const [listings, total, sellerCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          seller: true,
          photos: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
        },
        skip,
        take: ITEMS_PER_PAGE,
        orderBy,
      }),
      prisma.listing.count({ where }),
      prisma.user.count({ where: { role: "SELLER" } }),
    ]);

    const formattedListings = listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      condition: listing.condition as "New" | "Like New" | "Good" | "Fair" | "Poor" | "Used",
      images: listing.photos.map((p) => p.url),
      seller: {
        name: listing.seller.name || "Anonymous",
        isVerified: listing.seller.isVerified,
      },
      category: listing.category?.name,
      isFeatured: listing.isFeatured,
      createdAt: listing.createdAt.toISOString(),
    }));

    return NextResponse.json({
      listings: formattedListings,
      total,
      sellerCount,
      page,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    });
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
