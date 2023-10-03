const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("shopify"))
{
  getShopifyList(urlParams.get("shopify"));
}

function httpGet(theUrl)
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", theUrl, false );
  xmlHttp.send( null );
  return xmlHttp.responseText;
}

function getShopifyList(shopifyUrl)
{
  let domain = (new URL(shopifyUrl));

  document.getElementById("output").innerHTML = "";
  const xmlContent = httpGet(shopifyUrl + ".xml");

  // Parse XML content
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

  // Extract the desired XML node
  const variantsQuery = xmlDoc.querySelectorAll("hash > variants > variant");
  const imagesQuery = xmlDoc.querySelectorAll("hash > images > image");

  const embed = {
    title: domain + " scraper",
    color: 3447003,
    fields: [],
    image: {
      url: imagesQuery[0].querySelector("src").textContent,
    },
    width: 500,
  };

  for (const element of variantsQuery)
  {
    document.getElementById("output").innerHTML += element.querySelector("option1").textContent;
    document.getElementById("output").innerHTML += "<br>";
    document.getElementById("output").innerHTML += element.querySelector("id").textContent;
    document.getElementById("output").innerHTML += "<br>";

    var link = "https://" + domain.hostname.replace('www.', '') + "/cart/" + element.querySelector("id").textContent + ":1";
    document.getElementById("output").innerHTML += "<a href=" + link + ">" + link + "</a>";
    document.getElementById("output").innerHTML += "<br>";
    document.getElementById("output").innerHTML += "<br>";
    
    embed.fields.push({
        name: element.querySelector("option1").textContent + " | " + element.querySelector("id").textContent,
        value: link,
    });
  }

  const data = {
    content: "",
    embeds: [embed]
  };

  if (urlParams.has("webhook"))
  {
    sendWebhook(urlParams.get("webhook"), data, embed);
  }
}

function sendWebhook(webhookUrl, data)
{    
  fetch(webhookUrl, {
    method: 'POST',
    headers:
    {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => {
    if (response.ok)
    {
      alert('Webhook sent successfully.');
    }
    else
    {
      alert('Error sending webhook.');
    }
  })
  .catch(error => {
      alert('Error sending webhook: ' + error.message);
  });
}