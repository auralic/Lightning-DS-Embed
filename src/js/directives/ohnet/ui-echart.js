angular.module('ohnet').directive('ohnetUiEchart', ['$compile', '$templateCache', '$log', 'ohnetDirective', 'ohnetUtils', function ($compile, $templateCache, $log, ohnetDirective, ohnetUtils) {

    //修改颜色和字体   --开始
    var background_color="#F6F6F6";
    var X_label_color="#333333";        //x轴坐标颜色
    var X_label_size='12';                //x轴坐标字体大小
    var Y_label_color="#333333";        //y轴坐标颜色
    var Y_label_size='12';                //y轴坐标字体大小
    var X_Frequency_color="#333333";    //x轴的单位Frequency(Hz)颜色
    var X_Frequency_size='12';            //x轴的单位Frequency(Hz)字体大小
    var X_middle_line_color="#E2E2E2";  //x轴水平中间线颜色
    var X_middle_line_width=1;        //x轴水平中间线宽度
    var Y_line_color="#E2E2E2";         //y轴右侧线颜色
    var Y_line_width=1;                 //y轴右侧线宽度
    var eq_line_color="#57B5E0";        //绘制的曲线颜色
    var eq_line_width=3;                //绘制的曲线粗细
    var X_value_line_color="#E2E2E2";   //垂直于X轴的对应20，50，100，200，500，1k，2k，5k，10k，20k颜色
    var X_value_line_width=1;           //垂直于X轴的对应20，50，100，200，500，1k，2k，5k，10k，20k宽度
    var Y_value_line_color="#E2E2E2";   //垂直于Y轴的对应0dB，3，6，9，12，-3，-6，-9，-12等颜色
    var Y_value_line_width=1;           //垂直于Y轴的对应0dB，3，6，9，12，-3，-6，-9，-12等宽度
    var scatter_color1="#FFFFFF";       //小圆圈的内部颜色
    var scatter_color2="#57B5E0";       //小圆圈的边框颜色
    var scatter_size=10;                //小圆圈的大小
    var bar_distance=-21;
    //修改颜色和字体   --结束

    var myChart;
    var data_merge;  //合并的曲线值
    var data_value_each; //记录原来所有曲线值的三维数组
    var gain_all_value; //记录原来的总Gain值
    var circle_value_each;
    var y_min;
    var y_max;
    var y_interval;
    var _elementId;
    var lastOptions;
    var data_option;

    /**
     * 重置了初始化参数
     */
    function resetInit(){
        myChart = null;
        data_merge=[];  //合并的曲线值
        data_value_each=[]; //记录原来所有曲线值的三维数组
        gain_all_value=0.0; //记录原来的总Gain值
        circle_value_each=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        y_min = -12;
        y_max = 12;
        y_interval = 3;
        lastOptions = null;
        data_option = {
            animation:false,
            xAxis: [
                {
                    show:false,
                    name:"real_x_axis",
                    position:"top",
                    type:"log",
                    logBase:10,
                    min:20,
                    max:20000
                },
                {
                    type:"value",
                    position:"bottom",
                    // name:"Frequency(Hz)",
                    nameLocation:"center",
                    nameTextStyle:{
                        color:X_Frequency_color,
                        fontSize:X_Frequency_size
                    },
                    nameGap:30,
                    axisLine:{
                        lineStyle:{
                            width:X_middle_line_width,
                            color:X_middle_line_color
                        }
                    },
                    axisTick:{show:false},
                    axisLabel:{
                        show:true,
                        showMinLabel:true,
                        showMaxLabel:true,
                        color:X_label_color,
                        fontSize:X_label_size,
                        formatter: function (value, index) {
                            new_value = value;
                            if(value == 20000)
                            {
                                new_value = "20k";
                            }
                            return new_value;
                        }
                    },
                    splitLine:{
                        lineStyle:{
                            color:X_value_line_color,
                            width:X_value_line_width
                        }
                    },
                    interval:20000,
                    min:20,
                    max:20000
                }
            ],
            yAxis: {
                position:'right',
                axisLine:{
                    lineStyle:{
                        width:Y_line_width,
                        color:Y_line_color
                    }
                },
                axisLabel:{
		            show:true,
                    showMinLabel:true,
                    showMaxLabel:true,
                    color:Y_label_color,
                    fontSize:Y_label_size,
                    formatter: function (value, index) {
                        new_value = value;
                        if(value == 0)
                        {
                            new_value = value+"dB";
                        }
                        return new_value;
                    }
                },
                splitLine:{
                    lineStyle:{
                        color:Y_value_line_color,
                        width:Y_value_line_width
                    }
                },
                min:y_min,max:y_max,interval:y_interval
            },
            grid: {
                show:true,
                top:20,
                left:'5%',
                right:'10%',
                backgroundColor:background_color
            },
            series: [
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'scatter',symbolSize:scatter_size,itemStyle:{color:scatter_color1,borderColor:scatter_color2,opacity:1},data:[]},
                {type:'line',smooth:true,symbol:"none",lineStyle:{color:eq_line_color,width:eq_line_width},data:[]},
                {type: 'bar',cursor:"default",legendHoverLink:"false",barWidth:X_value_line_width,itemStyle:{normal:{color:X_value_line_color},emphasis:{color:X_value_line_color}},
                    data:
                    [
                        [30,y_max],[30,y_min],[40,y_max],[40,y_min],[60,y_max],[60,y_min],[70,y_max],[70,y_min],[80,y_max],[80,y_min],[90,y_max],[90,y_min],
                        [300,y_max],[300,y_min],[400,y_max],[400,y_min],[600,y_max],[600,y_min],[700,y_max],[700,y_min],[800,y_max],[800,y_min],[900,y_max],[900,y_min],
                        [3000,y_max],[3000,y_min],[4000,y_max],[4000,y_min],[6000,y_max],[6000,y_min],[7000,y_max],[7000,y_min],[8000,y_max],[8000,y_min],[9000,y_max],[9000,y_min],
                        [50,y_max],{value: [50,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '{@[0]}'}},
                        [100,y_max],{value: [100,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '{@[0]}'}},
                        [200,y_max],{value: [200,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '{@[0]}'}},
                        [500,y_max],{value: [500,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '{@[0]}'}},
                        [1000,y_max],{value: [1000,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '1k'}},
                        [2000,y_max],{value: [2000,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '2k'}},
                        [5000,y_max],{value: [5000,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '5k'}},
                        [10000,y_max],{value: [10000,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '10k'}}
                    ]
                }
            ]
        };
    };

    function set_each_eq(eq_name, eq_array, frequency_value, gain_value, q_value, slope_value)
    {
        var width_value = 0;
        var width_type_value = 0;
        var filter_type_value = 0;

        if(eq_name == "eq_peakdip")
        {
            width_value=q_value;
            width_type_value=4;
            filter_type_value=6;
        }
        else if(eq_name == "eq_highpass" || eq_name == "eq_lowpass")
        {
            if(eq_name == "eq_highpass")
            {
                width_value=0;
                width_type_value=0;
                filter_type_value=10;
                if(slope_value == 12)
                {
                    width_value = 0.707107;
                    width_type_value = 4;
                    filter_type_value = 1;
                }
            }
            else
            {
                width_value = 0;
                width_type_value = 0;
                filter_type_value = 9;
                if(slope_value == 12)
                {
                    width_value = 0.707107;
                    width_type_value = 4;
                    filter_type_value = 0;
                }
            }
        }
        else if(eq_name == "eq_bandpass" || eq_name == "eq_bandstop")
        {
            width_value=q_value;
            width_type_value=4;
            if(eq_name == "eq_bandpass")
            {
                filter_type_value=3;
            }
            else
            {
                filter_type_value=4;
            }
        }

        var p = {
            fc:frequency_value,
            gain:gain_value,
            width:width_value,
            width_type:width_type_value,
            filter_type:filter_type_value,
            b0:0.0,
            b1:0.0,
            b2:0.0,
            a1:0.0,
            a2:0.0,
            o:0.0,
            i1:0,
            i2:0,
            o1:0.0,
            o2:0.0
        };

        if(eq_name == "eq_peakdip" && gain_value==0)
        {
            for(var i=20; i<=20000; i++)
            {
                var each_dB = 0;
                data_merge[i-20][1] -= data_value_each[eq_array][i-20][1];
                data_value_each[eq_array][i-20][1] = each_dB;
            }
        }
        else
        {
            getParam(p);

            //先减去原来对应的eq_array曲线的值
            for(var i=20; i<=20000; i++)
            {
                var each_dB = get_dB_from_fc(p, i);
                if(each_dB == '-Infinity') {
                    each_dB=-100;
                }
                data_merge[i-20][1] -= data_value_each[eq_array][i-20][1];
                data_value_each[eq_array][i-20][1] = each_dB;
                data_merge[i-20][1] += each_dB;
            }
        }
        data_option.series[20].data = data_merge;
        circle_value_each[eq_array] = frequency_value;
        for(var i=0; i<20; i++)
        {
            var one_value = Math.round(circle_value_each[i]);
            if(one_value != 0)
            {
                if((data_merge[one_value-20][1] >= y_min) && (data_merge[one_value-20][1] <= y_max))
                {
                    data_option.series[i].data = [[one_value, data_merge[one_value-20][1]]];
                }
                else
                {
                    data_option.series[i].data = [];
                }
            }
            else
            {
                data_option.series[i].data = [];
            }
        }
        lastOptions = {
            baseOption:{},
      media:[
       //media开始
       {
        query:{},
                    option:data_option
       }
       //media结束
      ]};
    }



    function get_option()
    {
        var option = {
    		baseOption:{},
    		media:[
    			//media开始
    			{
    				query:{},
    				option:data_option
    			}
    			//media结束
    		]
    	};
        return option;
    }

    function do_set_yrange(yrange)
    {
        var range = yrange;
        if(range == 1)
        {
            y_min = -12;
            y_max = 12;
            y_interval = 3;
        }
        else if(range == 2)
        {
            y_min = -24;
            y_max = 24;
            y_interval = 6;
        }

        data_option.yAxis.min = y_min;
        data_option.yAxis.max = y_max;
        data_option.yAxis.interval = y_interval;
        var data_bar = [
            [30,y_max],[30,y_min],[40,y_max],[40,y_min],[60,y_max],[60,y_min],[70,y_max],[70,y_min],[80,y_max],[80,y_min],[90,y_max],[90,y_min],
            [300,y_max],[300,y_min],[400,y_max],[400,y_min],[600,y_max],[600,y_min],[700,y_max],[700,y_min],[800,y_max],[800,y_min],[900,y_max],[900,y_min],
            [3000,y_max],[3000,y_min],[4000,y_max],[4000,y_min],[6000,y_max],[6000,y_min],[7000,y_max],[7000,y_min],[8000,y_max],[8000,y_min],[9000,y_max],[9000,y_min],
            [50,y_max],{value: [50,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '{@[0]}'}},
            [100,y_max],{value: [100,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '{@[0]}'}},
            [200,y_max],{value: [200,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '{@[0]}'}},
            [500,y_max],{value: [500,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '{@[0]}'}},
            [1000,y_max],{value: [1000,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '1k'}},
            [2000,y_max],{value: [2000,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '2k'}},
            [5000,y_max],{value: [5000,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '5k'}},
            [10000,y_max],{value: [10000,y_min],label:{show:true,color:X_label_color,fontSize:X_label_size,position:"insideBottom",distance:bar_distance,formatter: '10k'}}
        ];
        data_option.series[21].data = data_bar;
        for(var i=0; i<20; i++)
        {
            var one_value = Math.round(circle_value_each[i]);
            if(one_value != 0)
            {
                if((data_merge[one_value-20][1] >= y_min) && (data_merge[one_value-20][1] <= y_max))
                {
                    data_option.series[i].data = [[one_value, data_merge[one_value-20][1]]];
                }
                else
                {
                    data_option.series[i].data = [];
                }
            }
            else
            {
                data_option.series[i].data = [];
            }
        }
        lastOptions = {
            baseOption:{},
            media:[
                //media开始
                {
                    query:{},
                    option:data_option
                }
                //media结束
            ]};
    };

    function do_set_gain(newGainValue) {
        for(var i=20; i<=20000; i++)
        {
            data_merge[i-20][1] -= gain_all_value;
            data_merge[i-20][1] += parseFloat(newGainValue);
        }
        gain_all_value = parseFloat(newGainValue);

        data_option.series[20].data = data_merge;

        for(var i=0; i<20; i++)
        {
            var one_value = Math.round(circle_value_each[i]);
            if(one_value != 0)
            {
                if((data_merge[one_value-20][1] >= y_min) && (data_merge[one_value-20][1] <= y_max))
                {
                    data_option.series[i].data = [[one_value, data_merge[one_value-20][1]]];
                }
                else
                {
                    data_option.series[i].data = [];
                }
            }
            else
            {
                data_option.series[i].data = [];
            }
        }
        lastOptions = {
            baseOption:{},
            media:[
                //media开始
                {
                    query:{},
                    option:data_option
                }
                //media结束
            ]};
    };

    function removeChart(eq_array)
    {
        for(var i=20; i<=20000; i++)
        {
            var each_dB = 0;
            data_merge[i-20][1] -= data_value_each[eq_array][i-20][1];
            data_value_each[eq_array][i-20][1] = each_dB;
        }
        data_option.series[20].data = data_merge;
        circle_value_each[eq_array] = 0;
        for(var i=0; i<20; i++)
        {
            var one_value = Math.round(circle_value_each[i]);
            if(one_value != 0)
            {
                if((data_merge[one_value-20][1] >= y_min) && (data_merge[one_value-20][1] <= y_max))
                {
                    data_option.series[i].data = [[one_value, data_merge[one_value-20][1]]];
                }
                else
                {
                    data_option.series[i].data = [];
                }
            }
            else
            {
                data_option.series[i].data = [];
            }
        }
        lastOptions = {
            baseOption:{},
            media:[
                //media开始
                {
                    query:{},
                    option:data_option
                }
                //media结束
            ]};
    };

    function getParam(p)
    {
        var w0, A, alpha, mult;
        w0 = 2 * Math.PI * p.fc / 384000;
        A = Math.exp(p.gain / 40 * Math.log(10.));
        alpha = 0;

        if (w0 > Math.PI) {
            // console.log('frequency must be less than half the sample-rate (Nyquist rate)');
            return -1;
        }

        /* Set defaults: */
        p.b0 = p.b1 = p.b2 = p.a1 = p.a2 = 0;
        p.a0 = 1;

        if (p.width != 0)
        {
            switch (p.width_type) {
            case 4:
                alpha = Math.sin(w0) / (2 * p.width);
                break;
            }
        }

        switch (p.filter_type) {
        case 0: /* H(s) = 1 / (s^2 + s/Q + 1) */
            p.b0 =  (1 - Math.cos(w0))/2;
            p.b1 =   1 - Math.cos(w0);
            p.b2 =  (1 - Math.cos(w0))/2;
            p.a0 =   1 + alpha;
            p.a1 =  -2*Math.cos(w0);
            p.a2 =   1 - alpha;
            break;
        case 1: /* H(s) = s^2 / (s^2 + s/Q + 1) */
            p.b0 =  (1 + Math.cos(w0))/2;
            p.b1 = -(1 + Math.cos(w0));
            p.b2 =  (1 + Math.cos(w0))/2;
            p.a0 =   1 + alpha;
            p.a1 =  -2*Math.cos(w0);
            p.a2 =   1 - alpha;
            break;
        case 3: /* H(s) = (s/Q) / (s^2 + s/Q + 1)      (constant 0 dB peak gain) */
            p.b0 =   alpha;
            p.b1 =   0;
            p.b2 =  -alpha;
            p.a0 =   1 + alpha;
            p.a1 =  -2*Math.cos(w0);
            p.a2 =   1 - alpha;
            break;
        case 4: /* H(s) = (s^2 + 1) / (s^2 + s/Q + 1) */
            p.b0 =   1;
            p.b1 =  -2*Math.cos(w0);
            p.b2 =   1;
            p.a0 =   1 + alpha;
            p.a1 =  -2*Math.cos(w0);
            p.a2 =   1 - alpha;
            break;
        case 6: /* H(s) = (s^2 + s*(A/Q) + 1) / (s^2 + s/(A*Q) + 1) */
            if (A == 1)
                return -1;
            p.b0 = 1 + alpha * A;
            p.b1 = -2 * Math.cos(w0);
            p.b2 = 1 - alpha * A;
            p.a0 = 1 + alpha / A;
            p.a1 = -2 * Math.cos(w0);
            p.a2 = 1 - alpha / A;
            break;
        case 9: /* single-pole */
            p.a1 = -Math.exp(-w0);
            p.b0 = 1 + p.a1;
            break;

        case 10:
            p.a1 = -Math.exp(-w0);
            p.b0 = (1 - p.a1)/2;
            p.b1 = -p.b0;
            break;
        }

        p.b2 /= p.a0;
        p.b1 /= p.a0;
        p.b0 /= p.a0;
        p.a2 /= p.a0;
        p.a1 /= p.a0;
        p.o = 2*Math.PI/384000;

        p.o2 = p.o1 = p.i2 = p.i1 = 0;
    }

    function  H(f, b0, b1, b2, a1, a2, o)
    {
          return Math.sqrt((b0*b0+b1*b1+b2*b2+2.*(b0*b1+b1*b2)*Math.cos(f*o)+2.*(b0*b2)*Math.cos(2.*f*o))/(1.+a1*a1+a2*a2+2.*(a1+a1*a2)*Math.cos(f*o)+2.*a2*Math.cos(2.*f*o)));
    }

    function get_dB_from_fc(p, p_fc)
    {
        var dB_value = 20*Math.log10(H(p_fc, p.b0, p.b1, p.b2, p.a1, p.a2, p.o));
        return dB_value;
    }

    /**
     * init echart bar element enter
     * @param {1} element 
     */
    function _initEchart (element, scope){
        resetInit();
        //根据宽度，设置不同的height
        // alert(element[0].offsetWidth);
        if(element[0].offsetWidth < 600) {
            element.height(element[0].offsetWidth/1.5);
        }
        else {
            element.height(element[0].offsetWidth/2.3);
        }

        myChart = echarts.init(element[0]);
        var option = get_option();
        // console.log('options is %o', option);
        myChart.setOption(option);

        for(var i=20; i<=20000; i++)
        {
            var each=[];
            var each_dB = 0;
            each.push(i,each_dB);
            data_merge.push(each);
        }
        for(var j=0; j<20; j++)
        {
            var data_value=[];
            for(var i=20; i<=20000; i++)
            {
                var each=[];
                var each_dB = 0;
                each.push(i,each_dB);
                data_value.push(each);
            }
            data_value_each.push(data_value);
        }
        // console.log('elet is %o', element);
    };



    var _echartParam  = {
        /**
         * 合并值 typeId = type_index
         */
        mergeValue : function (typeId, name, value) {
            var obj = this[typeId];
            var type = this.getType(typeId);
            if (obj == undefined) {
                obj = {
                    argCount : 0,
                    args : {},
                    argNum : this[type]
                }
                this[typeId] = obj;
            }
            obj.argCount ++;
            obj.args[name] = value;
            return obj.argCount >= obj.argNum;
        },
        getIndex : function (id){
            var p = id.lastIndexOf('_');
            if (p == -1) {
                return id;
            }
            return id.substring(p+1);
        },
        getType : function (id){
            var p = id.lastIndexOf('_');
            if (p == -1) {
                return id;
            }
            // console.log('get type id is %s', id);
            return id.substring(0,p);
        },

        getParams : function (id, type){
            var obj = this[type];
            // 获取 type
            return [this.getType(type) ,parseInt(this.getIndex(id)), obj.args.eq_frequency, obj.args.eq_gain, obj.args.eq_q, obj.args.eq_slope];
        },
        getObj : function (typeId) {
            var obj = this[typeId];
            return obj;
        },
        'eq_peakdip' : 5,
        'eq_highpass' : 4,
        'eq_lowpass': 4,
        'eq_bandpass': 4,
        'eq_bandstop': 4
    }; 


    /**
     * 绑定 事件，当子元素有数据变更时触发
     * @param {*}} data 
     */
    function bindChangeEvent (data){
        var subNodeId = data.source._id;

        // console.log('echart sub node value change, %s,%s,%o', subNodeId, data.new_value, data);

        // 处理 yrang 
        if (subNodeId == 'eq_yrange') {
            do_set_yrange(data.newVal);
            _drawEchart ();
            return;
        }
        // 如果是 eq_auto_gain_enable 直接返回
        if (subNodeId == 'eq_auto_gain_enable') {
            return;
        }
        // 处理 eq_all_gain
        if (subNodeId == 'eq_all_gain') {
            // console.log('echart eq_all_gain, %s,%s', subNodeId, data.newVal);
            do_set_gain(data.newVal);
            _drawEchart ();
            return;
        }
        //是否为eq_delete_*
        var delete_id_sub = subNodeId.lastIndexOf('_');
        if (delete_id_sub != -1) {
            var delete_id = subNodeId.substring(0,delete_id_sub);
            if (delete_id == 'eq_delete') {
                var eq_array = subNodeId.substring(delete_id_sub+1);
                removeChart(eq_array);
                _drawEchart ();
                return;
            }
        }

        // 根据不同的类型取不同的值
        var id = data.compoundSource._id;
        var typeId = data.compoundSource.sub_node.node[0].value.language_index + '_' + _echartParam.getIndex(id);
        var name = _echartParam.getType(data.source._id);
        //如果name包含“eq_frequency_type_”，则认为name就等于"eq_frequency"
        if(name.indexOf('eq_frequency_type_') >= 0) {
            name = 'eq_frequency';
        }
        // 设置数据
        if (_echartParam.mergeValue(typeId, name, data.newVal)) {
            var node_obj = _echartParam.getObj(typeId);
            if(node_obj.args.eq_enable == 1) {
                set_each_eq.apply(this, _echartParam.getParams(id, typeId));
            }
            else {
                removeChart(_echartParam.getIndex(id));
            }
            _drawEchart ();
        }
    };

    var _inetraval;

    function _drawEchart (){
        if (_inetraval) {
            window.clearTimeout(_inetraval);
        }
        if (!lastOptions) {
            return;
        }
        _inetraval = window.setTimeout(function (){
            myChart.setOption(lastOptions);
            _inetraval = null;
        }, 600);
    }

    function _resize(){
        myChart.resize({width:$('#' + _elementId).width()});
    }

  
    return ohnetDirective.merge({
        link : function(options){
        var scope = options.scope, attrs  = options.attrs, element = options.element, change = options.change , valid = options.valid;
        
        _initEchart(element, scope);
        
        ohnetUtils.emitEditable(scope, 'source.value', 0);

        // 添加 relation 关系事件
        ohnetUtils.$on('relation.' + scope.source._id, bindChangeEvent);

        

        scope.$on("$destroy", function() {
            myChart.dispose();
            delete myChart;
            if (_inetraval) {
                window.clearTimeout(_inetraval);
            }
            $(window).off('resize', _resize)
            ohnetUtils.$off('relation.' + scope.source._id);
        });
        _elementId = scope.source._id;

        $(window).on('resize', _resize);
  
        options.compound = false;
      }
    });
  }]);