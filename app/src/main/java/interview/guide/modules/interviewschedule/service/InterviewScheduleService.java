package interview.guide.modules.interviewschedule.service;

import interview.guide.common.auth.CurrentUser;
import interview.guide.common.exception.BusinessException;
import interview.guide.common.exception.ErrorCode;
import interview.guide.modules.interviewschedule.model.CreateInterviewRequest;
import interview.guide.modules.interviewschedule.model.InterviewScheduleDTO;
import interview.guide.modules.interviewschedule.model.InterviewScheduleEntity;
import interview.guide.modules.interviewschedule.model.InterviewStatus;
import interview.guide.modules.interviewschedule.repository.InterviewScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewScheduleService {

    private final InterviewScheduleRepository repository;

    private static final String[] COPYABLE_FIELDS = {
        "companyName", "position", "interviewTime", "interviewType",
        "meetingLink", "roundNumber", "interviewer", "notes"
    };

    @Transactional
    public InterviewScheduleDTO create(CreateInterviewRequest request) {
        InterviewScheduleEntity entity = new InterviewScheduleEntity();
        BeanUtils.copyProperties(request, entity);
        entity.setStatus(InterviewStatus.PENDING);
        entity.setUserId(CurrentUser.getUserId());

        return toDTO(repository.save(entity));
    }

    @Transactional
    public InterviewScheduleDTO update(Long id, CreateInterviewRequest request) {
        InterviewScheduleEntity entity = getByIdOrThrow(id);
        BeanUtils.copyProperties(request, entity, "id", "status");
        return toDTO(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public InterviewScheduleDTO updateStatus(Long id, InterviewStatus status) {
        InterviewScheduleEntity entity = getByIdOrThrow(id);
        entity.setStatus(status);
        return toDTO(repository.save(entity));
    }

    public List<InterviewScheduleDTO> getAll(String status, LocalDateTime start, LocalDateTime end) {
        Long userId = CurrentUser.getUserId();
        // 未登录时返回全部（向后兼容）
        if (userId == null) {
            List<InterviewScheduleEntity> entities = buildEntityList(status, start, end);
            return entities.stream().map(this::toDTO).collect(Collectors.toList());
        }

        // 已登录时只返回当前用户的数据
        List<InterviewScheduleEntity> entities = buildEntityList(status, start, end);
        return entities.stream()
            .filter(e -> userId.equals(e.getUserId()))
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    private List<InterviewScheduleEntity> buildEntityList(String status, LocalDateTime start, LocalDateTime end) {
        Long userId = CurrentUser.getUserId();
        if (userId != null) {
            return repository.findByUserIdOrderByInterviewTimeAsc(userId);
        }
        if (start != null && end != null) {
            return repository.findByInterviewTimeBetween(start, end);
        } else if (status != null) {
            return repository.findByStatus(InterviewStatus.valueOf(status));
        }
        return repository.findAll();
    }

    public InterviewScheduleDTO getById(Long id) {
        return toDTO(getByIdOrThrow(id));
    }

    private InterviewScheduleEntity getByIdOrThrow(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.INTERVIEW_SCHEDULE_NOT_FOUND, "面试日程不存在: " + id));
    }

    private InterviewScheduleDTO toDTO(InterviewScheduleEntity entity) {
        InterviewScheduleDTO dto = new InterviewScheduleDTO();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }
}
