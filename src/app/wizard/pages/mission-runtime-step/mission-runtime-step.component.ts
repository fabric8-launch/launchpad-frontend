import { Component, Host, Input, OnDestroy, OnInit, Optional, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as _ from 'lodash';
import { Broadcaster } from 'ngx-base';
import { Subscription } from 'rxjs';

import {
  createViewMissions,
  createViewRuntimes,
  ViewMission,
  ViewRuntime
} from './mission-runtime-step.model';
import {
  LauncherStep,
  Booster,
  Cluster,
  LauncherComponent,
  MissionRuntimeService,
  Projectile,
  StepState,
  BoosterVersion
} from 'ngx-launcher';

@Component({
  selector: 'missionruntime-step',
  templateUrl: './mission-runtime-step.component.html',
  styleUrls: ['./mission-runtime-step.component.scss']
})
export class MissionRuntimeStepComponent extends LauncherStep implements OnInit, OnDestroy {
  public booster: {mission: any, runtime: any} = {
    mission: {}, runtime: {
      id: undefined, name: undefined,
      version: { id: undefined, name: undefined }
    }
  };

  @Input()
  public canChangeVersion: boolean;

  public disabledReason = EmptyReason;
  private _missions: ViewMission[] = [];
  private _runtimes: ViewRuntime[] = [];
  private _boosters: Booster[] = null;
  private _cluster: Cluster;

  private subscriptions: Subscription[] = [];

  constructor(@Host() @Optional() public launcherComponent: LauncherComponent,
              private missionRuntimeService: MissionRuntimeService,
              public _DomSanitizer: DomSanitizer,
              private projectile: Projectile<any>,
              private broadcaster: Broadcaster) {
    super(projectile);
  }

  public ngOnInit() {
    const state = new StepState(this.booster,
      [
        { name: 'mission', value: 'mission.id', restorePath: 'missions.id' },
        { name: 'runtime', value: 'runtime.id', restorePath: 'runtimes.id' },
        { name: 'runtimeVersion', value: 'runtime.version.id', restorePath: 'runtimes.versions.id' }
      ]
    );
    this.projectile.setState(this.id, state);
    if (this.launcherComponent) {
      this.launcherComponent.addStep(this);
    }
    this.subscriptions.push(this.missionRuntimeService.getBoosters()
      .subscribe((boosters) => {
        this._boosters = boosters;
        this.initBoosters();
        this.restore(this);
      }));
    this.subscriptions.push(this.broadcaster.on<Cluster>('cluster').subscribe((cluster) => {
      this._cluster = cluster;
      this.initBoosters();
    }));
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    this.projectile.unSetState(this.id);
  }

  public initBoosters(): void {
    this._runtimes = createViewRuntimes(this._boosters);
    this._missions = createViewMissions(this._boosters);
    this.updateBoosterViewStatus();
  }

  // Accessors

  /**
   * Returns a list of missions to display
   *
   * @returns {Mission[]} The missions to display
   */
  get missions(): ViewMission[] {
    return this._missions;
  }

  /**
   * Returns a list of runtimes to display
   *
   * @returns {Runtime[]} The runtimes to display
   */
  get runtimes(): ViewRuntime[] {
    return this._runtimes;
  }

  get cluster(): string {
    return this._cluster ? this._cluster.type : '';
  }

  /**
   * Returns indicator for at least one selection has been made
   *
   * @returns {boolean} True at least one selection has been made
   */
  get selectionAvailable(): boolean {
    return (this.booster.mission !== undefined
      || this.booster.runtime !== undefined);
  }

  /**
   * Returns indicator that step is completed
   *
   * @returns {boolean} True if step is completed
   */
  get completed(): boolean {
    return (this.booster.mission.id !== undefined
      && this.booster.runtime.id !== undefined
      && this.booster.runtime.version.id !== undefined);
  }

  // Steps

  /**
   * Reset current selections
   */
  public resetSelections(): void {
    this.clearMission();
    this.clearRuntime();
    this.updateBoosterViewStatus();
  }

  public selectBooster(mission?: ViewMission, runtime?: ViewRuntime, version?: BoosterVersion): void {
    if (mission && !mission.disabled) {
      Object.assign(this.booster.mission, mission);
    }
    if (runtime && !runtime.disabled) {
      Object.assign(this.booster.runtime, runtime);
      const newVersion = version ? version : runtime.selectedVersion;
      Object.assign(this.booster.runtime.version, newVersion);
      if (this.completed) {
        this.broadcaster.broadcast('booster-changed', this.booster);
      }
      this.broadcaster.broadcast('runtime-changed', runtime);
    }

    this.updateBoosterViewStatus();
  }

  public clearRuntime(): void {
    this.booster.runtime = {
      id: undefined, name: undefined,
      version: { id: undefined, name: undefined }
    };
    this.updateBoosterViewStatus();
  }

  public selectRuntime(runtime: ViewRuntime): void {
    this.clearMission();
    this.updateBoosterViewStatus();
    this.selectBooster(null, runtime);
  }

  private updateBoosterViewStatus(): void {
    const cluster = this.cluster;
    this._missions.forEach((mission) => {
      let availableBoosters = MissionRuntimeService.getAvailableBoosters(mission.boosters,
        cluster, mission.id);
      if (availableBoosters.empty) {
        mission.shrinked = true;
      } else {
        availableBoosters = MissionRuntimeService.getAvailableBoosters(mission.boosters,
          cluster, mission.id, this.booster.runtime ? this.booster.runtime.id : undefined);
      }
      mission.disabled = availableBoosters.empty;
      mission.disabledReason = availableBoosters.emptyReason;
      mission.community = this.canChangeVersion && !mission.disabled && this.booster.runtime.version.id === 'community';
      if (this.booster.mission && this.booster.mission.id === mission.id && availableBoosters.empty) {
        this.clearMission();
      }
    });
    this._runtimes.forEach((runtime) => {
      const availableBoosters = MissionRuntimeService.getAvailableBoosters(runtime.boosters,
        cluster, this.booster.mission ? this.booster.mission.id : undefined, runtime.id);
      const versions = _.chain(availableBoosters.boosters)
        .map((b) => b.version)
        .uniq()
        .value()
        .sort(MissionRuntimeService.compareVersions);
      if (this.booster.runtime && this.booster.runtime.id === runtime.id && availableBoosters.empty) {
        this.clearRuntime();
      }
      runtime.disabled = availableBoosters.empty;
      runtime.disabledReason = availableBoosters.emptyReason;
      runtime.versions = versions;
      runtime.selectedVersion = this.getRuntimeSelectedVersion(runtime.id, versions);
    });
  }

  private getRuntimeSelectedVersion(runtimeId: string, versions: BoosterVersion[]): BoosterVersion {
    if (this.booster.runtime && this.booster.runtime.id === runtimeId && this.booster.runtime.version.id) {
      const selectedVersion = versions.find((v) => v.id === this.booster.runtime.version.id);
      if (selectedVersion) {
        return selectedVersion;
      }
      // If the current selected version is not compatible, auto select the first available version
      const autoSelectedVersion = _.first(versions);
      this.booster.runtime.version.id = autoSelectedVersion.id;
      return autoSelectedVersion;
    }
    return _.first(versions);
  }

  private clearMission(): void {
    this.booster.mission = {};
  }
}

export enum EmptyReason {
  NOT_IMPLEMENTED,
  CLUSTER_INCOMPATIBILITY
}
