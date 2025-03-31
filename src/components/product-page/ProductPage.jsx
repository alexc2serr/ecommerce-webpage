// ProductPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import StarRatings from "../product-grid/StarRatings";
import AddToCartButton from "./AddToCartButton";
import { ToastContainer } from "react-toastify";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import RelatedProducts from "./RelatedProducts";

function ProductPage() {
  const { uri } = useParams(); // Ahora usamos 'uri'
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        // Endpoint para obtener producto por URI
        const response = await fetch(`/api/products/uri/${uri}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.log("Problem with API connectivity", error);
      }
    };

    fetchProductData();
  }, [uri]);

  if (!product) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="max-w-screen-2xl mx-auto p-9 flex flex-col lg:flex-row mt-6 mb-8">
        <div className="flex flex-col lg:flex-row w-full gap-x-24 justify-center" key={product.id}>
          <div className="flex justify-center">
            <LazyLoadImage
              effect="blur"
              src={`/${product.image}`} // Ruta absoluta (asegúrate de que product.image sea "images/xxx.jpg")
              alt={product.description}
              wrapperClassName="product-image mb-8 lg:mb-0"
              width={400}
              height={400}
            />
          </div>
          <div className="flex flex-col w-full lg:max-w-lg">
            <h1 className="text-3xl mb-1">{product.title}</h1>
            <StarRatings rating={Number(product.rating)} />
            {product.discounted_price ? (
              <div className="float-left pt-3 pb-3 border-b mb-2">
                <span className="line-through pr-2 text-lg">${product.price}</span>
                <span className="text-emerald-600 text-xl">${product.discounted_price}</span>
              </div>
            ) : (
              <span className="pt-3 pb-3 border-b mb-2 text-xl">${product.price}</span>
            )}
            <p className="pt-3 pb-3 w-full text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </p>
            <p className="pt-3 pb-3 w-full text-base">
              Duis aute irure dolor in reprehenderit in voluptate...
            </p>
            <AddToCartButton product={product} />
          </div>
        </div>
        <ToastContainer />
      </div>
      <div>
        {product.category ? (
          <RelatedProducts category={product.category} currentProductId={product.id} />
        ) : (
          <p>No related products</p>
        )}
      </div>
    </>
  );
}

export default ProductPage;
