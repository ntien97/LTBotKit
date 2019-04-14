resp = require("../response/response.js");
request = require("request");

const CONVERSATION_MANAGER_ENDPOINT = "https://rlet-bot.herokuapp.com/api/LT-conversation-manager"

const ATTR_LIST = ["interior_floor", "interior_room", "legal", "orientation", "position", "realestate_type", "surrounding_characteristics", "surrounding_place", "transaction_type"];
const ENTITY_LIST = ["area", "location", "potential", "price", "addr_district"]
const LOCATION_ATTR_LIST = ["addr_city", "addr_street", "addr_ward", "addr_district"]

module.exports = function (controller) {

    var promiseBucket = {
        default: []
    }

    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
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

    function restartConversation(bot, message) {
        bot.reply(message, { graph: {}, text: resp.thank });
        var id = message.user
        console.log(id)
        if (id) {
            request.delete(CONVERSATION_MANAGER_ENDPOINT + "?graph_id=" + id, (error, res, body) => {
                console.log(body)
            })
        }
        setTimeout(() => {
            bot.reply(message, resp.hello)
        }, 1000)

    }

    function callConversationManager(bot, message) {

        var id = message.user
        var raw_mesg = message.text
        var showCustomButton = false;
        var force_show = false;
        var remove_more = false;
        var filter_attr = false;
        var filter_all = false;
        console.log(message)
        if (message.continue) {
            bot.reply(message, resp.whatyourattr);
            return;
        }
        if (message.quit) {
            restartConversation(bot, message);
            return;
        }
        if (message.force_show) {
            force_show = true;
            raw_mesg = "";
        }
        if (message.remove_more) {
            remove_more = true;
            force_show = true;
            raw_mesg = "";
        }
        if (message.clearAttr) {

            request.delete(CONVERSATION_MANAGER_ENDPOINT + "?graph_id=" + id + "&new_node=" + message.clearAttr.key, (error, res, body) => {
                console.log(body)
            })

            showCustomButton = true;
            raw_mesg = "";
        }
        if (message.filterAttr) {
            filter_attr = true;
            force_show = true;
            raw_mesg = "";
        }
        if (message.filter_all) {
            filter_all = true;
            force_show = true;
            raw_mesg = "";
        }


        if (!promiseBucket.id) {
            promiseBucket.id = []
        }
        var bucket = promiseBucket.id
        var pLoading = { value: true };
        bucket.push(pLoading)

        function requestGET() {
            pLoading.value = false;
            if (bucket.every(ele => { return ele.value === false })) {
                // + "&force_get_results=true"
                var postfix_force_show = "";
                if (force_show === true) {
                    postfix_force_show = "&force_get_results=true"
                }
                if (filter_attr === true) {
                    postfix_force_show += "&key_filter=" + message.filterAttr.key + "&value_filter=" + message.filterAttr.value
                }
                if (filter_all === true) {
                    postfix_force_show += "&key_filter=all";
                }
                console.log(postfix_force_show)
                request.get(CONVERSATION_MANAGER_ENDPOINT + "?graph_id=" + id + postfix_force_show, {}, (error, res, body) => {
                    // console.log(body)
                    if (error) {
                        console.error(error)
                        return
                    }
                    try {
                        response_body = JSON.parse(body);
                        console.log("***")
                        console.log(JSON.stringify(response_body));
                        var graph = response_body.graph;
                        // bot.reply(message, {
                        //     graph: graph
                        // })
                        console.log("***")
                        if (promiseBucket.id.every(ele => { return ele.value === false })) {
                            bucket = []
                            promiseBucket.id = []
                            if (response_body.initial_fill == false) {
                                bot.reply(message, {
                                    text: resp.dontunderstand
                                })
                            } else
                                if (response_body.has_results === true) {

                                    if (response_body.result_container.length == 0 || remove_more === true) {
                                        var list = []
                                        var mentioned_attributes = response_body.mentioned_attributes;

                                        for (var i = 0; i < mentioned_attributes.length; i++) {
                                            (function (ele) {
                                                if (ATTR_LIST.indexOf(ele) != -1 || (ele !== "addr_district" && ele !== "location" && ENTITY_LIST.indexOf(ele) != -1)) {
                                                    if (graph[ele] && graph[ele].value_raw) {
                                                        var arr = graph[ele].value_raw;
                                                        if (arr.length > 0) {
                                                            var value = arr[0]
                                                            for (var j = 1; j < arr.length; j++) {
                                                                value += ", " + arr[j]
                                                            }
                                                            list.push({ value: value, key: ele });
                                                        }
                                                    }
                                                }
                                                if (LOCATION_ATTR_LIST.indexOf(ele) != -1) {
                                                    if (graph["location"][ele] && graph["location"][ele].value_raw) {
                                                        var arr = graph["location"][ele].value_raw;
                                                        if (arr.length > 0) {
                                                            var value = arr[0]
                                                            for (var j = 1; j < arr.length; j++) {
                                                                value += ", " + arr[j]
                                                            }
                                                            list.push({ value: value, key: ele });
                                                        }
                                                    }
                                                }
                                            })(mentioned_attributes[i]);
                                        }
                                        if (list && list.length > 0) {
                                            bot.reply(message, {
                                                text: resp.cantfind,
                                                attr_list: list,
                                                graph: graph,
                                            })
                                        } else {
                                            bot.reply(message, { graph: graph, text: resp.wetried })
                                        }

                                    } else {
                                        // for result_container != []
                                        if (response_body.intent_values_container && !isEmpty(response_body.intent_values_container)) {
                                            bot.reply(message, {
                                                text: resp.showall,
                                                intent_dict: response_body.intent_values_container,
                                                graph: graph,
                                                force_result: [
                                                    {
                                                        title: 'Được rồi, cảm ơn!',
                                                        payload: {
                                                            'quit': true
                                                        }
                                                    },
                                                    {
                                                        title: 'Có',
                                                        payload: {
                                                            'filter_all': true,
                                                        },
                                                    },
                                                ]
                                            })
                                        } else {
                                            bot.reply(message, {
                                                text: [response_body.intent_response ? response_body.intent_response : "Kết quả của bạn: ", "Bạn có muốn thêm yêu cầu gì không?"],
                                                show_results: response_body.result_container,
                                                concerned_attributes: response_body.concerned_attributes,
                                                graph: graph,
                                                force_result: [
                                                    {
                                                        title: 'Có',
                                                        payload: {
                                                            'continue': true
                                                        },
                                                    },
                                                    {
                                                        title: 'Được rồi, cảm ơn!',
                                                        payload: {
                                                            'quit': true
                                                        }
                                                    }
                                                ]
                                            })
                                        }
                                    }

                                } else {
                                    if (showCustomButton) {
                                        bot.reply(message, {
                                            text: response_body.question,
                                            graph: graph,
                                            force_result: [
                                                {
                                                    title: 'Bỏ tiếp yêu cầu',
                                                    payload: {
                                                        'remove_more': true
                                                    },
                                                },
                                                {
                                                    title: 'In luôn kết quả',
                                                    payload: {
                                                        'force_show': true
                                                    }
                                                }
                                            ]
                                        })
                                    }
                                    else {
                                        bot.reply(message, {
                                            graph: graph,
                                            text: response_body.question
                                        })
                                    }
                                }
                        }
                    } catch (e) {
                        bot.reply(message, {
                            graph: graph,
                            text: resp.err
                        })
                    }
                })
            } else {
                console.log(bucket)
            }
        }

        if (raw_mesg && raw_mesg.length > 0) {
            request.post(CONVERSATION_MANAGER_ENDPOINT, {
                json: {
                    graph_id: id,
                    message: raw_mesg
                }
            }, (error, res, body) => {
                if (error) {
                    console.log(error);
                    bot.reply(message, {
                        graph: {},
                        text: resp.err
                    })
                    return 
                }
                requestGET()
            })
        } else {
            requestGET()
        }
    }

    controller.on('hello', conductOnboarding);
    controller.on('welcome_back', conductOnboarding);
    controller.on('message_received', callConversationManager);

}
