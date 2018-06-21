# Lambda setup

Zip up the files you want to upload (node modules, json, application files etc) and upload them using the lambda interface

# API gateway setup
As aws api gateway works with json and twillio only accepts xml and outputs x-www-urlencoded correct setup of the gateway api is crucial.

1. First setup gateway api normally as it is advised on aws docs.
2. Then in the resources tab click actions and create a method that handles post and is attached to your lambda method.  
3. After its creation go to "Method Execution" window and enter the "Integration Request Panel".
4. in the "Body Mapping Templates" delete the application/json file and create your own called "application/x-www-form-urlencoded" and copy the following in:

```
#set($httpPost = $input.path('$').split("&"))
{
#foreach( $kvPair in $httpPost )
#set($kvTokenised = $kvPair.split("="))
#if( $kvTokenised.size() > 1 )
	"$kvTokenised[0]" : "$kvTokenised[1]"#if( $foreach.hasNext ),#end
#else
	"$kvTokenised[0]" : ""#if( $foreach.hasNext ),#end
#end
#end
}

```

5. In the "Request Body Passthrough select "When there are no templates defined (recommended)" then save.
6. Go back to "Method Execution" and select "Integration Response" and open the "200" dropdown.
7. Set "Lambda Error Regex to" ``` .* ``` and "Content handling" to "Passthrough" and save.
8. Open up "Body Templates" and delete the default "application/json" template.
9. Create your own called  "application/xml" and paste following code in:
```
#set($inputRoot = $input.path('$'))
$inputRoot
```
then save.
10. Then finally go to "Method Response" in the "Method Execution" and change "Response Body for 200" content type to application/xml and make it empty. Save.
