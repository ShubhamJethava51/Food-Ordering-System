import axios from "axios";
import moment from "moment";
import Noty from "noty";
import order from "../../app/models/order";

export function initAdmin(socket) {
  const orderTableBody = document.querySelector("#orderTableBody");
  let orders = [];
  let markup;

  axios
    .get("/admin/orders", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    }) //first ajax request will go to that route after that we will get order data from the 'orderController' of the admin as request
    .then((res) => {
      orders = res.data; //received data will be stored
      markup = generateMarkup(orders); //structure(body) of the table will be created here
      orderTableBody.innerHTML = markup; //and here it'll get assigned to the real object of file
    })
    .catch((err) => {
      console.log(err);
    });

  function renderItems(items) {
    let parsedItems = Object.values(items);
    return parsedItems
      .map((menuItem) => {
        return `<p>${menuItem.item.name} - ${menuItem.qty}</p>`;
      })
      .join("");
  }

  // we have use a ajax request to generate markup everytime a new order is placed and show it without refreshing page
  function generateMarkup(orders) {
    return orders
      .map((order) => {
        return `
            <tr>
                <td class="border border-gray-500 px-4 py-2 text-green-500">
                    <p>${order._id}</p>
                    <p>${renderItems(order.items)}</p>
                </td>
                <td class="border border-gray-500 px-4 py-2">${
                  order.customerID.name
                }</td>
                <td class="border border-gray-500 px-4 py-2">${
                  order.address
                }</td>
                <td class="border border-gray-500 px-4 py-2">${order.phone}</td>
                <td class="border border-gray-500 px-4 py-2">
                    <div class="inline-block relative w-64">
                        <form action="/admin/order/status" method="post">
                            <input type="hidden" name="orderID" value="${
                              order._id
                            }">
                            <select onchange="this.form.submit()" name="status" class="block text-black appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                
                                <option value="order_placed" ${
                                  order.status == "order_placed"
                                    ? "selected"
                                    : ""
                                }>Placed</option>

                                <option value="confirmed" ${
                                  order.status == "confirmed" ? "selected" : ""
                                }>Confirmed</option>

                                <option value="prepared" ${
                                  order.status == "prepared" ? "selected" : ""
                                }>Prepared</option>

                                <option value="delivered" ${
                                  order.status == "delivered" ? "selected" : ""
                                }>Delivered</option>

                                <option value="completed" ${
                                  order.status == "completed" ? "selected" : ""
                                }>Completed</option>
                                  
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </form>
                    </div>
                </td>
                <td class="border border-gray-500 px-4 py-2">
                    ${moment(order.createdAt).format("hh:mm A")}
                </td>
            </tr>
        `;
      })
      .join("");
  }

  socket.on("orderPlaced", (order) => {
    new Noty({
      type: "success",
      timeout: 1000,
      text: "New Order!",
      progressBar: false,
    }).show();
    orders.unshift(order);
    orderTableBody.innerHTML = "";
    orderTableBody.innerHTML = generateMarkup(orders);
  });
}
