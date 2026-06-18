package com.harmony.health.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.harmony.health.common.Result;
import com.harmony.health.entity.Report;
import com.harmony.health.mapper.ReportMapper;
import com.harmony.health.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportMapper reportMapper;

    @Autowired
    private AiService aiService;

    @GetMapping
    public Result<List<Report>> list(@RequestParam(required = false) Integer userId,
                                   @AuthenticationPrincipal String currentUsername) {
        LambdaQueryWrapper<Report> query = new LambdaQueryWrapper<>();
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            if (userId != null) {
                query.eq(Report::getUserId, userId);
            } else {
                return Result.success(new ArrayList<>());
            }
        } else if (userId != null) {
            query.eq(Report::getUserId, userId);
        }
        
        return Result.success(reportMapper.selectList(query));
    }

    @PostMapping
    public Result<Report> create(@RequestBody Report report) {
        report.setStatus("PENDING");
        report.setCreatedAt(LocalDateTime.now());
        reportMapper.insert(report);
        return Result.success(report);
    }

    @PostMapping("/{id}/generate")
    public Result<Report> generate(@PathVariable Integer id) {
        Report report = reportMapper.selectById(id);
        if (report == null) {
            return Result.error("未找到对应体检报告");
        }
        
        // 触发 AI 生成
        String summary = aiService.generateHealthSummary(report.getBasicData());
        report.setAiSummary(summary);
        report.setStatus("FINALIZED");
        // 更新现有报告
        reportMapper.updateById(report);
        return Result.success(report);
    }
}
