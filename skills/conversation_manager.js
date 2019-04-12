resp = require("../response/response.js");
request = require("request");

const CONVERSATION_MANAGER_ENDPOINT = "http://2dc7dd45.ngrok.io/api/LT-conversation-manager"

module.exports = function (controller) {

    var promiseBucket = {
        default: []
    }

    function conductOnboarding(bot, message) {

        bot.startConversation(message, function (err, convo) {
            var id = message.user
            console.log(id)
            if (id) {
                request.delete(CONVERSATION_MANAGER_ENDPOINT + "?graph_id=" + id, (error, res, body) => {
                    console.log(body)
                })
            }
            convo.say({
                text: resp.hello,
            });

        });
    }

    function callConversationManager(bot, message) {
        bot.reply(message, {
            text: "hello",
            attr_list : [{value:"Kinh doanh",key:"potential"},{value:"Căn hộ",key:"realestate_type"}]
        })

        var id = message.user
        var raw_mesg = message.text
        if (!promiseBucket.id) {
            promiseBucket.id = []
        }
        var bucket = promiseBucket.id
        var pLoading = { value: true };
        bucket.push(pLoading)
        request.post(CONVERSATION_MANAGER_ENDPOINT, {
            json: {
                graph_id: id,
                message: raw_mesg
            }
        }, (error, res, body) => {
            pLoading.value = false;
            if (bucket.every(ele => { return ele.value === false })) {
                // + "&force_get_results=true"
                request.get(CONVERSATION_MANAGER_ENDPOINT + "?graph_id=" + id , {}, (error, res, body) => {
                    // console.log(body)
                    if (error) {
                        console.error(error)
                        return
                    }
                    try {
                        response_body = JSON.parse(body);
                        console.log("***")
                        console.log(response_body)
                        // console.log(response_body.question);
                        // console.log(JSON.stringify(response_body.query));
                        // console.log(response_body.has_results);
                        // console.log(response_body.result_container);
                        // console.log(response_body.concerned_attributes);
                        console.log("***")
                        if (promiseBucket.id.every(ele => { return ele.value === false })) {
                            bucket = []
                            promiseBucket.id = []
                            if (response_body.has_results === true) {
                                // for result_container != []
                                bot.reply(message, {
                                    show_results: response_body.result_container,
                                    concerned_attributes: response_body.concerned_attributes
                                })
                            } else {
                                bot.reply(message, response_body.question)
                            }
                        }
                    } catch (e) {
                        bot.reply(message, resp.err)
                    }
                })
            } else {
                console.log(bucket)
            }

        })
    }

    controller.on('hello', conductOnboarding);
    controller.on('welcome_back', conductOnboarding);
    controller.on('message_received', callConversationManager);

}
