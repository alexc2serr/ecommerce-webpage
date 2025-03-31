import React, { useState, useEffect } from "react";

import ProductSorting from "./ProductSorting";
import ProductFiltering from "./ProductFiltering";
import AddToCartButton from "./addToCartButton";
import ProductCounter from "./ProductCounter";
import StarRatings from "./StarRatings";

import { ToastContainer } from "react-toastify";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const ITEMS_PER_PAGE = 12;
const INITIAL_PAGE_COUNT = 1;

function ProductGrid({ category }) {
    const [products, setProducts] = useState([]); // Holds the current state of the products (e.g when after filtered or sorted)
    const [searchTerm, setSearchTerm] = useState(""); // State for search term
    const [sortedProducts, setSortedProducts] = useState({});
    const [filteredProducts, setFilteredProducts] = useState({});
    const [pageCount, setPageCount] = useState(INITIAL_PAGE_COUNT);

    const [productData, setProductData] = useState({
        products: [],
        isDataLoaded: false,
    });

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const response = await fetch("/api/products");
                let data = await response.json();

                // Ordenar los productos por ID descendiente
                data.sort((a, b) => b.id - a.id);

                setProductData({
                    products: data,
                    isDataLoaded: true,
                });
            } catch (error) {
                console.log("Problem with API connectivity", error);
            }
        };

        fetchProductData();
    }, []);

    useEffect(() => {
        validate();
    }, [sortedProducts, filteredProducts, productData, searchTerm]);

    // Only returns the products with the correct category
    const getCategoryProducts = () => {
        if (category) {
            return productData.products.filter(
                (product) => product.category === category
            );
        }
        return productData.products;
    };

    /** This function makes sure the correct products are being displayed when filtering/sorting is selected */
    const validate = () => {
        let productsToDisplay = getCategoryProducts();

        // Apply search filter (before sorting or other filtering)
        if (searchTerm) {
            productsToDisplay = productsToDisplay.filter((product) =>
                product.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Set sorted products when no filtering
        if (sortedProducts.isSorted && !filteredProducts.isFiltered) {
            return setProducts(sortedProducts.products);
        }

        // Set filtered products when no sorting
        if (filteredProducts.isFiltered && !sortedProducts.isSorted) {
            return setProducts(filteredProducts.products);
        }

        // Set both
        if (sortedProducts.isSorted && filteredProducts.isFiltered) {
            return setProducts(
                sortedProducts.products.filter((product) =>
                    filteredProducts.products.some(
                        (filteredProduct) => filteredProduct.id == product.id
                    )
                )
            );
        }

        return setProducts(productsToDisplay); // Return products after applying search
    };

    const handleLoadMore = () => {
        setPageCount((prevPageCount) => prevPageCount + 1);
    };

    const getPaginatedData = () => {
        const startIndex = (pageCount - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        return products.slice(0, endIndex);
    };

    return (
        <>
            <div className="max-w-screen-2xl mx-auto p-9 flex flex-col md:flex-col lg:flex-row">
                <div className="flex flex-col relative lg:mr-8  mb-5 lg:mb-0">
                    <ProductFiltering
                        products={getCategoryProducts()}
                        setFilteredProducts={setFilteredProducts}
                    />
                </div>

                <div className="flex flex-col w-full">
                    <div className="flex justify-end sm:justify-between items-center text-sm mb-2">
                        <div className="hidden sm:block">
                            <ProductCounter
                                total={getCategoryProducts().length}
                            />
                        </div>

                        
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="mb-4 flex justify-between items-center">
                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border p-2 rounded-md w-full sm:w-80"
                        />
                        <ProductSorting
                            products={getCategoryProducts()}
                            setSortedProducts={setSortedProducts}
                        />
                        
                    </div>
                    

                    <div className="min-h-[80%]">
                        <ul className="mt-2 mb-12 product-list overflow-hidden">
                            {/* Renders products */}
                            {getPaginatedData().length > 0 ? (
                                getPaginatedData().map((product) => {
                                    return (
                                        <li
                                            key={product.id}
                                            className="flex flex-col product-item justify-between"
                                        >
                                            <a
                                                href={"products/" + product.uri}
                                                className="hover:underline flex flex-col"
                                            >
                                                <LazyLoadImage
                                                    effect="blur"
                                                    src={product.image}
                                                    alt={product.description}
                                                    width={250}
                                                    height={250}
                                                />

                                                <span className="text-base">
                                                    {product.title}
                                                </span>
                                            </a>

                                            <StarRatings
                                                rating={product.rating}
                                            />

                                            <p className="h-fit text-sm my-1">
                                                {product.description}
                                            </p>

                                            {product.discounted_price ? (
                                                <div className="float-left">
                                                    <span className="text-base line-through pr-2">
                                                        ${product.price}
                                                    </span>
                                                    <span className="text-emerald-600 text-lg">
                                                        $
                                                        {
                                                            product.discounted_price
                                                        }
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-lg">
                                                    ${product.price}
                                                </span>
                                            )}

                                            <AddToCartButton
                                                product={product}
                                            />
                                        </li>
                                    );
                                })
                            ) : (
                                <span className="text-center w-full block mt-5">
                                    No products found.
                                </span>
                            )}
                        </ul>
                    </div>

                    <div className="flex justify-center mx-auto">
                        <div className="d-grid text-center">
                            <div className="text-sm p-6">
                                <ProductCounter
                                    count={getPaginatedData().length}
                                    total={getCategoryProducts().length}
                                />
                            </div>

                            {products.length > pageCount * ITEMS_PER_PAGE && (
                                <button
                                    onClick={handleLoadMore}
                                    className="text-black border bg-white font-normal py-2 px-8 mb-8"
                                >
                                    Load More
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </>
    );
}
export default ProductGrid;
