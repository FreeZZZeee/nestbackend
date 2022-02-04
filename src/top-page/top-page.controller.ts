import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode, Logger,
	NotFoundException,
	Param,
	Patch,
	Post, UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import {FindTopPageDto} from './dto/find-top-page.dto';
import {TopPageService} from './top-page.service';
import {CreateTopPageDto} from './dto/create-top-page.dto';
import {IdValidationPipe} from '../pipes/ad-validation.pipe';
import {NOT_FOUND_TOP_PAGE_ERROR} from './top-page.constants';
import {JwtAuthGuard} from '../auth/guards/jwt.guard';
import {HhService} from '../hh/hh.service';
import {Cron, CronExpression, SchedulerRegistry} from '@nestjs/schedule';

@Controller('top-page')
export class TopPageController {
	constructor(
		private readonly topPageService: TopPageService,
		private readonly hhService: HhService,
		private readonly scheduleRegistry: SchedulerRegistry
		) {
	}

	@UseGuards(JwtAuthGuard)
	@Post('create')
	async create(@Body() dto: CreateTopPageDto){
		return this.topPageService.create(dto);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':id')
	async get(@Param('id', IdValidationPipe) id: string) {
		const page = await this.topPageService.findById(id);
		if (!page) {
			throw new NotFoundException(NOT_FOUND_TOP_PAGE_ERROR);
		}
		return page;
	}

	@Get('byAlias/:alias')
	async getByAlias(@Param('alias') alias: string) {
		const page = await this.topPageService.findByAlias(alias);
		if (!page) {
			throw new NotFoundException(NOT_FOUND_TOP_PAGE_ERROR);
		}
		return page;
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async delete(@Param('id', IdValidationPipe) id: string) {
		const deletedPage = await this.topPageService.deleteById(id);
		if (!deletedPage) {
			throw new NotFoundException(NOT_FOUND_TOP_PAGE_ERROR);
		}
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	async patch(@Param('id', IdValidationPipe) id: string, @Body() dto: CreateTopPageDto) {
		const updatedPage = await this.topPageService.updateById(id, dto);
		if (!updatedPage) {
			throw new NotFoundException(NOT_FOUND_TOP_PAGE_ERROR);
		}
		return updatedPage;
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('find')
	async find(@Body() dto: FindTopPageDto) {
		return this.topPageService.findByCategory(dto.firstCategory);
	}

	@Get('textSearch/:text')
	async textSearch(@Param('text') text: string) {
		return this.topPageService.findByText(text);
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {name: 'test'})
	async test() {
		const data = await this.topPageService.findForHhUpdate(new Date());
		for (let page of data) {
			const hhData = await this.hhService.getData(page.category);
			page.hh = hhData;
			await this.sleep();
			await this.topPageService.updateById(page._id, page);
		}
	}

	sleep () {
		return new Promise<void>((resolve, reject) => {
			setTimeout(() => {
				resolve();
			}, 1000);
		});
	}
}
