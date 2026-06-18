package com.harmony.health.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.harmony.health.common.Result;
import com.harmony.health.entity.Package;
import com.harmony.health.mapper.PackageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
public class PackageController {

    @Autowired
    private PackageMapper packageMapper;

    @GetMapping
    public Result<List<Package>> list() {
        return Result.success(packageMapper.selectList(null));
    }

    @PostMapping
    public Result<String> add(@RequestBody Package pkg) {
        packageMapper.insert(pkg);
        return Result.success("添加成功");
    }

    @PutMapping
    public Result<String> update(@RequestBody Package pkg) {
        packageMapper.updateById(pkg);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Integer id) {
        packageMapper.deleteById(id);
        return Result.success("删除成功");
    }
}
