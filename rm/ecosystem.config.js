module.exports = {
    apps: [
        {
            name: "production",// 生产环境
            script: "./app.js", // 项目启动入口文件
            instances: 4, // 启用多少个实例,用于负载均衡
            exec_mode: 'cluster',  // 应用程序启动模式，这里设置的是cluster_mode（集群），默认是fork
            watch: true, // 监听应用目录的变化，一旦发生变化，自动重启
            // out_fil: "log/node-app.stdout.log", // 自定义应用程序日志文件
            env: {
                "NODE_ENV": "production", // 项目环境变量
                "PORT": 3001
            }
        }, 
        {
            name: "test", // 测试环境
            script: "./app.js",
            watch: true,
            env: {
                "NODE_ENV": "test",
                "PORT": 3001
            }
        }
    ]
}