// variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

let cart = [];

let buttonsDOM = [];

//getting the products

class Products {

    async getProducts() {
        //pratice for fetch 
    //   let result = await fetch('products.json').then(result1 => {
    //     console.log(result1);  //it wil return
    //     // return result1.json();  
    //   }).then(data => {
    //       console.log(data);
    //       return data;
    //   });

    try {
        let result = await fetch('products.json');
        let data = await result.json();

        // destruction the products.json
        let products = data.items;
        products = products.map(item => {
            const price = item.fields.price;
            const title = item.fields.title;
            const id = item.sys.id;
            const image = item.fields.image.fields.file.url;
            return { price : price,
                     title : title,
                     id : id,
                     image : image    
            }
        });

        // console.log(products);

        return products;
    }
    catch(error) {
        console.log(error);
    }
    }
}

//display products
class UI {
    displayProducts(products) {
        // console.log(products);
        products.forEach(product => {
            const display = `
            <article class="product">
               <div class="img-container">
                   <img src="${product.image}" alt="products" 
                   class="product-img"/>
                   <button class="bag-btn" data-id="${product.id}">
                       <i class="fas fa-shopping-cart"></i>
                       add to cart
                   </button>
               </div>
               <h3>${product.title}</h3>
               <h4>$${product.price}</h4>
           </article>
            </section>
            `;

            productsDOM.insertAdjacentHTML('beforeend',display);

        });
    }
   
    getBagButton() {
        // const btn1 = document.querySelectorAll('.bag-btn');
        // const buttons = Array.from(btn1);
        // console.log(buttons);

        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            // console.log(id);
            let inCart = cart.find( item => item.id === id);
            if(inCart) {
                button.innerText = "In cart";
                button.disabled = true;
            }
            button.addEventListener('click', (event) => {
                // console.log(event);
                event.target.innerText = "In cart";
                event.target.disabled = true;
                // get product from products
                let cartItem = {...Storage.getProduct(id),amount: 1};
                // console.log(cartItem);
                //add product to the cart
                cart = [...cart,cartItem];
                // console.log(cart);
                // save cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart);
                // display cart item
                this.addCartItem(cartItem);
                //show the cart
                this.showCart();
                });    
        })
    }

    setCartValues(cart) {
        let itemsTotal = 0;
        let tempTotal = 0; // amount total
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount
        });
        // console.log(tempTotal);
        cartItems.innerText = itemsTotal;
        cartTotal.innerText = parseFloat (tempTotal.toFixed(2));
        // console.log(cartTotal , cartItems);
    }

    addCartItem(item) {
        const display = `
        <div class="cart-item">
            <img src=${item.image} alt="product" />
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
        </div>
        `;
        cartContent.insertAdjacentHTML("beforeend",display);
        // console.log(cartContent);
    }

    showCart() {
        cartDOM.classList.add('showCart');
        cartOverlay.classList.add('transparentBcg');
    }

    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click',this.showCart);
        closeCartBtn.addEventListener('click',this.hideCart);
    }

    populateCart(cart) {
        cart.forEach(item => {
            this.addCartItem(item);
        })
    }

    hideCart() {
        cartDOM.classList.remove('showCart');
        cartOverlay.classList.remove('transparentBcg');
    }

    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
        this.clearCart();
    });

    cartContent.addEventListener('click' ,event => {
        // console.log(event.target);
        if(event.target.classList.contains('remove-item')) {
           let removeItem = event.target;
           let id = removeItem.dataset.id;
        //    console.log(removeItem.parentElement.parentElement);
           cartContent.removeChild(removeItem.parentElement.parentElement);
           this.removeItem(id);
        }
        else if(event.target.classList.contains('fa-chevron-up')) {
            let addAmount = event.target;
            let id = addAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount + 1;
            console.log(cart)
            Storage.saveCart(cart);
            this.setCartValues(cart);
            addAmount.nextElementSibling.innerHTML = tempItem.amount;
        }
        else if(event.target.classList.contains('fa-chevron-down')) {
            let subAmount = event.target;
            let id = subAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount - 1;
            if(tempItem.amount > 0) {
                Storage.saveCart(cart);
                this.setCartValues(cart);
                subAmount.previousElementSibling.innerHTML = tempItem.amount;
            }
            else {
                cartContent.removeChild(subAmount.parentElement.parentElement);
                this.removeItem(id);
            }
        }
    });

    }

    clearCart() {
        let cartItems = cart.map(item => item.id);     // will give cart item ids
        // console.log(cartItems);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);   
        }
        this.hideCart();
    }

    removeItem(id) {
        // console.log('before',cart);
        cart = cart.filter(item => item.id !== id);
        // console.log('cart value from removeItem',cart);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }
    getSingleButton(id) {
        return buttonsDOM.find(button =>  button.dataset.id === id);
    }

}

//local Storage
class Storage {
    static saveProduct (products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        // console.log(products);
        return products.find(product => product.id === id) 
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart() {
      return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();   

    ui.setupAPP();
    products.getProducts().then(products => {ui.displayProducts(products)
    Storage.saveProduct(products);
    }).then(() => {
        ui.getBagButton();
        ui.cartLogic();
    });
})


