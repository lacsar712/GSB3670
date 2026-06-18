package com.harmony.health.service;

import org.springframework.stereotype.Service;

@Service
public class AiService {
    
    /**
     * 模拟调用 AIGC 接口生成健康报告总结
     */
    public String generateHealthSummary(String basicData) {
        // 本地模拟根据体检数据生成中文建议的规则引擎或模板
        return "【AI 健康分析建议】\n" +
               "基于您的体检数据（" + basicData + "），您的身体状况总体良好。\n" +
               "1. 指标分析：目前各项基础代谢指标处于正常范围。\n" +
               "2. 改进建议：建议保持规律作息，增加每周 3 次的有氧运动。\n" +
               "3. 饮食提示：减少高油脂摄入，多补充膳食纤维。";
    }
}
